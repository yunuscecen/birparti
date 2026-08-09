import mongoose from "mongoose";
import slugify from "slugify";

import ForumCategory from "../models/ForumCategory.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import ForumTopicInteraction from "../models/ForumTopicInteraction.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import createForumNotification from "../services/forumNotificationService.js";
const createBaseSlug = (value = "") => {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const createUniqueTopicSlug = async (title) => {
  const baseSlug =
    createBaseSlug(title) ||
    `forum-konusu-${Date.now()}`;

  let slug = baseSlug;
  let counter = 2;

  while (
    await ForumTopic.exists({
      slug,
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const getUserFullName = (user) => {
  const fullName = [
    user?.firstName,
    user?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user?.name ||
    "Forum Üyesi"
  );
};

const serializeUser = (
  user,
  fallbackName = "Forum Üyesi"
) => {
  if (!user) {
    return {
      id: null,
      name: fallbackName,
      role: null,
    };
  }

  return {
    id: user._id,
    name:
      getUserFullName(user) ||
      fallbackName,
    role: user.role || "member",
  };
};

const serializeReply = (reply) => {
  const replyData = reply.toObject();

  const serialized = {
    ...replyData,

    authorInfo: serializeUser(
      reply.author,
      reply.authorName
    ),

    replyToUserInfo:
      reply.replyToReply
        ? serializeUser(
            reply.replyToUser,
            reply.replyToName ||
              "Forum Üyesi"
          )
        : null,

    childReplies: [],
  };

  delete serialized.author;
  delete serialized.replyToUser;

  return serialized;
};

const findReplyTarget = async ({
  topicId,
  replyToReplyId,
}) => {
  if (!replyToReplyId) {
    return null;
  }

  if (
    !mongoose.isValidObjectId(
      replyToReplyId
    )
  ) {
    throw new AppError(
      "Yanıt verilen kayıt geçerli değil.",
      400
    );
  }

  const targetReply =
    await ForumReply.findOne({
      _id: replyToReplyId,
      topic: topicId,
      status: "published",
    });

  if (!targetReply) {
    throw new AppError(
      "Yanıt vermek istediğiniz mesaj bulunamadı.",
      404
    );
  }

  /*
   * Alt cevaba cevap veriliyorsa bağlı olduğu
   * ana yanıt hâlâ görünür durumda olmalıdır.
   */
  if (targetReply.parentReply) {
    const rootReplyExists =
      await ForumReply.exists({
        _id: targetReply.parentReply,
        topic: topicId,
        status: "published",
        parentReply: null,
      });

    if (!rootReplyExists) {
      throw new AppError(
        "Bu konuşma grubu artık yanıt almıyor.",
        409
      );
    }
  }

  return targetReply;
};


const findInteractiveTopicBySlug =
  async (slugValue) => {
    const slug = String(
      slugValue || ""
    )
      .trim()
      .toLowerCase();

    const topic =
      await ForumTopic.findOne({
        slug,
        approvalStatus:
          "approved",

        status: {
          $in: [
            "open",
            "locked",
          ],
        },
      });

    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    return topic;
  };

const recalculateTopicMetrics =
  async (topicId) => {
    const normalizedTopicId =
      new mongoose.Types.ObjectId(
        String(topicId)
      );

    const [metrics] =
      await ForumTopicInteraction.aggregate([
        {
          $match: {
            topic:
              normalizedTopicId,
          },
        },

        {
          $group: {
            _id: null,

            upvoteCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$vote",
                      1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            downvoteCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$vote",
                      -1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            supportCount: {
              $sum: {
                $cond: [
                  "$isSupported",
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const topic =
      await ForumTopic.findById(
        topicId
      );

    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    const upvoteCount =
      metrics?.upvoteCount || 0;

    const downvoteCount =
      metrics?.downvoteCount || 0;

    const supportCount =
      metrics?.supportCount || 0;

    const voteScore =
      upvoteCount -
      downvoteCount;

    topic.upvoteCount =
      upvoteCount;

    topic.downvoteCount =
      downvoteCount;

    topic.voteScore =
      voteScore;

    topic.supportCount =
      supportCount;

    topic.popularityScore =
      Math.max(
        0,
        (topic.viewCount || 0) +
          (topic.replyCount ||
            0) *
            5 +
          voteScore * 3 +
          supportCount * 4
      );

    await topic.save();

    return topic;
  };

const serializeInteraction = (
  interaction
) => {
  return {
    vote:
      interaction?.vote || 0,

    isSupported:
      Boolean(
        interaction
          ?.isSupported
      ),
  };
};

const serializeTopicMetrics = (
  topic
) => {
  return {
    voteScore:
      topic.voteScore || 0,

    upvoteCount:
      topic.upvoteCount || 0,

    downvoteCount:
      topic.downvoteCount || 0,

    supportCount:
      topic.supportCount || 0,

    popularityScore:
      topic.popularityScore || 0,

    isSolved:
      Boolean(topic.isSolved),

    solvedAt:
      topic.solvedAt || null,
  };
};

/**
 * POST /api/forum-topics
 */
export const createForumTopic = asyncHandler(
  async (req, res) => {
    const {
      title,
      body,
      category: categoryId,
    } = req.validatedBody;

    const category =
      await ForumCategory.findOne({
        _id: categoryId,
        isActive: true,
      });

    if (!category) {
      throw new AppError(
        "Seçilen forum kategorisi bulunamadı veya aktif değil.",
        404
      );
    }

    const slug =
      await createUniqueTopicSlug(title);

    const authorName =
      getUserFullName(req.user);

    const topic =
      await ForumTopic.create({
        title,
        slug,
        body,
        category: category._id,
        author: req.user._id,
        authorName,
        status: "open",
        isPinned: false,
        viewCount: 0,
        replyCount: 0,
        approvalStatus: "pending",
rejectionReason: "",
reviewedBy: null,
reviewedAt: null,
        lastActivityAt: new Date(),
        lastReplyAt: null,
      });

    await topic.populate([
      {
        path: "category",
        select: "name slug color",
      },
      {
        path: "author",
        select: "firstName lastName role",
      },
    ]);

    res.status(201).json({
      success: true,
      message:
         "Forum konusu yönetici onayına gönderildi.",

      data: {
        topic: {
          ...topic.toObject(),

          authorInfo: serializeUser(
            topic.author,
            topic.authorName
          ),
        },
      },
    });
  }
);

/**
 * GET /api/forum-topics/:slug/interaction
 */
export const getMyForumTopicInteraction =
  asyncHandler(
    async (req, res) => {
      const topic =
        await findInteractiveTopicBySlug(
          req.params.slug
        );

      const userId =
        req.user?._id ||
        req.user?.id;

      const interaction =
        await ForumTopicInteraction.findOne({
          topic: topic._id,
          user: userId,
        });

      res.status(200).json({
        success: true,

        data: {
          interaction:
            serializeInteraction(
              interaction
            ),

          topic:
            serializeTopicMetrics(
              topic
            ),
        },
      });
    }
  );

/**
 * PATCH /api/forum-topics/:slug/vote
 */
export const updateForumTopicVote =
  asyncHandler(
    async (req, res) => {
      const topic =
        await findInteractiveTopicBySlug(
          req.params.slug
        );

      const userId =
        req.user?._id ||
        req.user?.id;

      const { vote } =
        req.validatedBody;

      let interaction =
        await ForumTopicInteraction.findOne({
          topic: topic._id,
          user: userId,
        });

      if (!interaction) {
        interaction =
          new ForumTopicInteraction({
            topic: topic._id,
            user: userId,
          });
      }

      interaction.vote = vote;

      await interaction.save();

      if (
        interaction.vote === 0 &&
        !interaction.isSupported
      ) {
        await interaction.deleteOne();
        interaction = null;
      }

      const updatedTopic =
        await recalculateTopicMetrics(
          topic._id
        );

      res.status(200).json({
        success: true,

        message:
          vote === 0
            ? "Oyunuz kaldırıldı."
            : "Oyunuz kaydedildi.",

        data: {
          interaction:
            serializeInteraction(
              interaction
            ),

          topic:
            serializeTopicMetrics(
              updatedTopic
            ),
        },
      });
    }
  );

/**
 * PATCH /api/forum-topics/:slug/support
 */
export const updateForumTopicSupport =
  asyncHandler(
    async (req, res) => {
      const topic =
        await findInteractiveTopicBySlug(
          req.params.slug
        );

      const userId =
        req.user?._id ||
        req.user?.id;

      const { isSupported } =
        req.validatedBody;

      let interaction =
        await ForumTopicInteraction.findOne({
          topic: topic._id,
          user: userId,
        });

      if (!interaction) {
        interaction =
          new ForumTopicInteraction({
            topic: topic._id,
            user: userId,
          });
      }

      interaction.isSupported =
        isSupported;

      await interaction.save();

      if (
        interaction.vote === 0 &&
        !interaction.isSupported
      ) {
        await interaction.deleteOne();
        interaction = null;
      }

      const updatedTopic =
        await recalculateTopicMetrics(
          topic._id
        );

      res.status(200).json({
        success: true,

        message: isSupported
          ? "Konuya desteğiniz kaydedildi."
          : "Konu desteğiniz kaldırıldı.",

        data: {
          interaction:
            serializeInteraction(
              interaction
            ),

          topic:
            serializeTopicMetrics(
              updatedTopic
            ),
        },
      });
    }
  );

/**
 * PATCH /api/forum-topics/:slug/solved
 */
export const updateForumTopicSolvedStatus =
  asyncHandler(
    async (req, res) => {
      const topic =
        await findInteractiveTopicBySlug(
          req.params.slug
        );

      const userId =
        req.user?._id ||
        req.user?.id;

      const privilegedRoles = [
        "moderator",
        "admin",
        "superAdmin",
      ];

      const isAuthor =
        String(topic.author || "") ===
        String(userId || "");

      const canUpdate =
        isAuthor ||
        privilegedRoles.includes(
          req.user?.role
        );

      if (!canUpdate) {
        throw new AppError(
          "Bu konunun çözüm durumunu değiştirme yetkiniz yok.",
          403
        );
      }

      const { isSolved } =
        req.validatedBody;

      topic.isSolved =
        isSolved;

      topic.solvedAt =
        isSolved
          ? new Date()
          : null;

      topic.solvedBy =
        isSolved
          ? userId
          : null;

      topic.lastActivityAt =
        new Date();

      await topic.save();

      res.status(200).json({
        success: true,

        message: isSolved
          ? "Konu çözüldü olarak işaretlendi."
          : "Konunun çözüm işareti kaldırıldı.",

        data: {
          topic:
            serializeTopicMetrics(
              topic
            ),
        },
      });
    }
  );

/**
 * POST /api/forum-topics/:slug/replies
 */
export const createForumReply = asyncHandler(
  async (req, res) => {
    const slug = String(
      req.params.slug || ""
    )
      .trim()
      .toLowerCase();

    const topic = await ForumTopic.findOne({
  slug,
  approvalStatus: "approved",

  status: {
    $in: ["open", "locked"],
  },
});



    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    if (topic.status === "locked") {
      throw new AppError(
        "Bu konu yeni yanıtlara kapatılmıştır.",
        403
      );
    }

    const {
      body,
      replyToReplyId,
    } = req.validatedBody;

    const targetReply =
      await findReplyTarget({
        topicId: topic._id,
        replyToReplyId,
      });

    /*
     * Hedef ana yanıtsa kendi kimliği kullanılır.
     * Hedef alt cevapsa bağlı olduğu ana yanıt
     * kullanılır. Böylece yalnızca tek girinti olur.
     */
    const rootReplyId = targetReply
      ? targetReply.parentReply ||
        targetReply._id
      : null;

    const authorName =
      getUserFullName(req.user);

    const reply =
      await ForumReply.create({
        topic: topic._id,
        author: req.user._id,
        authorName,
        body,
        status: "published",

        parentReply: rootReplyId,

        replyToReply:
          targetReply?._id || null,

        replyToUser:
          targetReply?.author || null,

        replyToName:
          targetReply?.authorName || "",
      });

    const now = new Date();
topic.replyCount += 1;
topic.lastReplyAt = now;
topic.lastActivityAt = now;

topic.popularityScore =
  Math.max(
    0,
    (topic.viewCount || 0) +
      topic.replyCount * 5 +
      (topic.voteScore || 0) *
        3 +
      (topic.supportCount || 0) *
        4
  );

await topic.save();

    await reply.populate([
      {
        path: "author",
        select: "firstName lastName role",
      },
      {
        path: "replyToUser",
        select: "firstName lastName role",
      },
    ]);

const actorId =
  req.user?._id ||
  req.user?.id;

if (targetReply) {
  /*
   * Bir kullanıcı başka bir yanıta cevap verdi.
   */
  await createForumNotification({
    recipient:
      targetReply.author,

    actor:
      actorId,

    type:
      "reply_reply",

    topic:
      topic._id,

    reply:
      reply._id,

    title:
      "Forum yanıtınıza cevap geldi",

    message:
      `${authorName}, forumdaki yanıtınıza cevap verdi.`,

    link:
      `/forum/${topic.slug}#yanit-${reply._id}`,

    uniqueKey:
      `forum-reply-reply:${reply._id}`,
  });
} else {
  /*
   * Kullanıcı doğrudan forum konusuna
   * ana yanıt gönderdi.
   */
  await createForumNotification({
    recipient:
      topic.author,

    actor:
      actorId,

    type:
      "topic_reply",

    topic:
      topic._id,

    reply:
      reply._id,

    title:
      "Forum konunuza yeni yanıt geldi",

    message:
      `${authorName}, “${topic.title}” başlıklı konunuza yanıt verdi.`,

    link:
      `/forum/${topic.slug}#yanit-${reply._id}`,

    uniqueKey:
      `forum-topic-reply:${reply._id}`,
  });
}

    res.status(201).json({
      success: true,
      message:
        targetReply
          ? "Cevabınız başarıyla gönderildi."
          : "Yanıtınız başarıyla gönderildi.",

      data: {
        reply: serializeReply(reply),

        rootReplyId:
          rootReplyId
            ? String(rootReplyId)
            : null,

        topic: {
          id: topic._id,
          slug: topic.slug,
          replyCount: topic.replyCount,
          lastReplyAt: topic.lastReplyAt,
          lastActivityAt:
            topic.lastActivityAt,
        },
      },
    });
  }
);