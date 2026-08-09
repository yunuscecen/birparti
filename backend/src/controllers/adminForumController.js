import mongoose from "mongoose";
import slugify from "slugify";

import ForumCategory from "../models/ForumCategory.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import createForumNotification from "../services/forumNotificationService.js";

const createSlug = (value = "") => {
  return slugify(value, {
    lower: true,
    strict: true,
    locale: "tr",
  });
};

const escapeRegExp = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Geçersiz kayıt kimliği.", 400);
  }
};

const ensureUniqueCategorySlug = async ({
  slug,
  excludedCategoryId = null,
}) => {
  const filter = {
    slug,
  };

  if (excludedCategoryId) {
    filter._id = {
      $ne: excludedCategoryId,
    };
  }

  const existingCategory = await ForumCategory.exists(filter);

  if (existingCategory) {
    throw new AppError(
      "Bu kategori adresi başka bir kategoride kullanılıyor.",
      409
    );
  }
};

const serializeTopicAuthor = (topic) => {
  if (!topic.author) {
    return {
      id: null,
      name: topic.authorName || "Bir Parti",
      role: null,
    };
  }

  const fullName = [
    topic.author.firstName,
    topic.author.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: topic.author._id,
    name: fullName || topic.authorName || "Forum Üyesi",
    role: topic.author.role || "member",
  };
};
const serializeForumUser = (
  user,
  fallbackName = "Forum Üyesi"
) => {
  if (!user) {
    return {
      id: null,
      name: fallbackName,
      email: "",
      role: null,
    };
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user._id,
    name: fullName || fallbackName,
    email: user.email || "",
    role: user.role || "member",
  };
};

const serializeAdminReply = (reply) => {
  const serialized =
    typeof reply.toObject === "function"
      ? reply.toObject()
      : { ...reply };

  serialized.authorInfo =
    serializeForumUser(
      reply.author,
      reply.authorName ||
        "Forum Üyesi"
    );

  serialized.replyToUserInfo =
    reply.replyToReply
      ? serializeForumUser(
          reply.replyToUser,
          reply.replyToName ||
            "Forum Üyesi"
        )
      : null;

  delete serialized.author;
  delete serialized.replyToUser;

  return serialized;
};

/*
 * Yalnızca public tarafta gerçekten görünen
 * yanıtları sayar.
 *
 * Ana yanıt gizliyse, ona bağlı yayınlanmış alt
 * cevaplar da public tarafta görünmez ve toplam
 * yanıta dahil edilmez.
 */
const recalculateTopicReplyStats = async (
  topicId
) => {
  const topic =
    await ForumTopic.findById(
      topicId
    ).select("createdAt");

  if (!topic) {
    return null;
  }

  const publishedRootIds =
    await ForumReply.find({
      topic: topicId,
      status: "published",
      parentReply: null,
    }).distinct("_id");

  const visibleReplyConditions = [
    {
      parentReply: null,
    },
  ];

  if (
    publishedRootIds.length > 0
  ) {
    visibleReplyConditions.push({
      parentReply: {
        $in: publishedRootIds,
      },
    });
  }

  const visibleReplyFilter = {
    topic: topicId,
    status: "published",

    $or: visibleReplyConditions,
  };

  const [
    visibleReplyCount,
    latestVisibleReply,
  ] = await Promise.all([
    ForumReply.countDocuments(
      visibleReplyFilter
    ),

    ForumReply.findOne(
      visibleReplyFilter
    )
      .sort({
        createdAt: -1,
      })
      .select("createdAt")
      .lean(),
  ]);

  const lastReplyAt =
    latestVisibleReply?.createdAt ||
    null;

  const lastActivityAt =
    lastReplyAt ||
    topic.createdAt ||
    new Date();

  await ForumTopic.findByIdAndUpdate(
    topicId,
    {
      $set: {
        replyCount:
          visibleReplyCount,

        lastReplyAt,

        lastActivityAt,
      },
    },
    {
      runValidators: true,
    }
  );

  return {
    replyCount:
      visibleReplyCount,

    lastReplyAt,

    lastActivityAt,
  };
};
/**
 * GET /api/admin/forum-overview
 */
export const getAdminForumOverview = asyncHandler(
  async (req, res) => {
    const [
      categoryCount,
      activeCategoryCount,
      topicCount,
      openTopicCount,
      lockedTopicCount,
      hiddenTopicCount,
      publishedReplyCount,
      hiddenReplyCount,
    ] = await Promise.all([
      ForumCategory.countDocuments(),

      ForumCategory.countDocuments({
        isActive: true,
      }),

      ForumTopic.countDocuments(),

      ForumTopic.countDocuments({
        status: "open",
      }),

      ForumTopic.countDocuments({
        status: "locked",
      }),

      ForumTopic.countDocuments({
        status: "hidden",
      }),

      ForumReply.countDocuments({
        status: "published",
      }),

      ForumReply.countDocuments({
        status: "hidden",
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        overview: {
          categoryCount,
          activeCategoryCount,
          topicCount,
          openTopicCount,
          lockedTopicCount,
          hiddenTopicCount,
          publishedReplyCount,
          hiddenReplyCount,
        },
      },
    });
  }
);

/**
 * GET /api/admin/forum-categories
 */
export const getAdminForumCategories = asyncHandler(
  async (req, res) => {
    const categories = await ForumCategory.find()
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

    const categoryIds = categories.map(
      (category) => category._id
    );

    const topicCounts =
      categoryIds.length > 0
        ? await ForumTopic.aggregate([
            {
              $match: {
                category: {
                  $in: categoryIds,
                },
              },
            },
            {
              $group: {
                _id: "$category",
                count: {
                  $sum: 1,
                },
              },
            },
          ])
        : [];

    const topicCountMap = new Map(
      topicCounts.map((item) => [
        String(item._id),
        item.count,
      ])
    );

    res.status(200).json({
      success: true,

      data: {
        categories: categories.map((category) => ({
          ...category,

          topicCount:
            topicCountMap.get(String(category._id)) || 0,
        })),
      },
    });
  }
);

/**
 * POST /api/admin/forum-categories
 */
export const createAdminForumCategory = asyncHandler(
  async (req, res) => {
    const data = req.validatedBody;

    const categorySlug = createSlug(
      data.slug || data.name
    );

    if (!categorySlug) {
      throw new AppError(
        "Geçerli bir kategori adresi oluşturulamadı.",
        400
      );
    }

    await ensureUniqueCategorySlug({
      slug: categorySlug,
    });

    const category = await ForumCategory.create({
      name: data.name,
      slug: categorySlug,
      description: data.description,
      color: data.color,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    });

    res.status(201).json({
      success: true,
      message: "Forum kategorisi oluşturuldu.",

      data: {
        category,
      },
    });
  }
);

/**
 * PATCH /api/admin/forum-categories/:categoryId
 */
export const updateAdminForumCategory = asyncHandler(
  async (req, res) => {
    ensureObjectId(req.params.categoryId);

    const category = await ForumCategory.findById(
      req.params.categoryId
    );

    if (!category) {
      throw new AppError(
        "Forum kategorisi bulunamadı.",
        404
      );
    }

    const data = req.validatedBody;

    const categorySlug = createSlug(
      data.slug || data.name
    );

    if (!categorySlug) {
      throw new AppError(
        "Geçerli bir kategori adresi oluşturulamadı.",
        400
      );
    }

    await ensureUniqueCategorySlug({
      slug: categorySlug,
      excludedCategoryId: category._id,
    });

    category.name = data.name;
    category.slug = categorySlug;
    category.description = data.description;
    category.color = data.color;
    category.isActive = data.isActive;
    category.sortOrder = data.sortOrder;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Forum kategorisi güncellendi.",

      data: {
        category,
      },
    });
  }
);

/**
 * DELETE /api/admin/forum-categories/:categoryId
 */
export const deleteAdminForumCategory = asyncHandler(
  async (req, res) => {
    ensureObjectId(req.params.categoryId);

    const category = await ForumCategory.findById(
      req.params.categoryId
    );

    if (!category) {
      throw new AppError(
        "Forum kategorisi bulunamadı.",
        404
      );
    }

    const topicCount = await ForumTopic.countDocuments({
      category: category._id,
    });

    if (topicCount > 0) {
      throw new AppError(
        "Bu kategoriye bağlı forum konuları bulunduğu için kategori silinemez.",
        409
      );
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Forum kategorisi silindi.",
    });
  }
);

/**
 * GET /api/admin/forum-topics
 */
export const getAdminForumTopics = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 15,
        1
      ),
      50
    );

    const search = String(req.query.search || "").trim();
    const category = String(
      req.query.category || ""
    ).trim();

    const status = String(req.query.status || "").trim();
    const approvalStatus = String(
  req.query.approvalStatus || ""
).trim();
    const pinned = String(req.query.pinned || "").trim();

    const filter = {};

    if (
  [
    "pending",
    "approved",
    "rejected",
  ].includes(approvalStatus)
) {
  filter.approvalStatus =
    approvalStatus;
}

    if (search) {
      const safeSearch = escapeRegExp(search);

      filter.$or = [
        {
          title: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          body: {
            $regex: safeSearch,
            $options: "i",
          },
        },
        {
          authorName: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }

    if (
      category &&
      mongoose.isValidObjectId(category)
    ) {
      filter.category = category;
    }

   if (
  [
    "open",
    "locked",
    "archived",
    "hidden",
  ].includes(status)
) {
  filter.status = status;
}

if (
  [
    "pending",
    "approved",
    "rejected",
  ].includes(approvalStatus)
) {
  filter.approvalStatus =
    approvalStatus;
}

if (pinned === "true") {
  filter.isPinned = true;
}

    if (pinned === "false") {
      filter.isPinned = false;
    }

    const skip = (page - 1) * limit;

    const [topics, totalTopics] = await Promise.all([
      ForumTopic.find(filter)
        .populate({
          path: "category",
          select: "name slug color isActive",
        })
        .populate({
          path: "author",
          select: "firstName lastName email role",
        })
        .sort({
          isPinned: -1,
          lastActivityAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ForumTopic.countDocuments(filter),
    ]);

    const totalPages = Math.max(
      Math.ceil(totalTopics / limit),
      1
    );

    res.status(200).json({
      success: true,

      data: {
        topics: topics.map((topic) => {
          const serializedTopic = {
            ...topic,
            authorInfo: serializeTopicAuthor(topic),
          };

          delete serializedTopic.author;

          return serializedTopic;
        }),

        pagination: {
          page,
          limit,
          totalTopics,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
    });
  }
);

/**
 * GET /api/admin/forum-topics/:topicId
 */
export const getAdminForumTopicById = asyncHandler(
  async (req, res) => {
    ensureObjectId(req.params.topicId);

    const topic = await ForumTopic.findById(
      req.params.topicId
    )
      .populate({
        path: "category",
        select: "name slug color isActive",
      })
      .populate({
        path: "author",
        select: "firstName lastName email role",
      })
      .lean();

    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    const replyCounts = await ForumReply.aggregate([
      {
        $match: {
          topic: topic._id,
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const replyCountMap = new Map(
      replyCounts.map((item) => [
        item._id,
        item.count,
      ])
    );

    const serializedTopic = {
      ...topic,
      authorInfo: serializeTopicAuthor(topic),

      moderationCounts: {
        published: replyCountMap.get("published") || 0,
        hidden: replyCountMap.get("hidden") || 0,
        deleted: replyCountMap.get("deleted") || 0,
      },
    };

    delete serializedTopic.author;

    res.status(200).json({
      success: true,

      data: {
        topic: serializedTopic,
      },
    });
  }
);

/**
 * PATCH /api/admin/forum-topics/:topicId/moderation
 */
export const updateAdminForumTopicModeration =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.topicId);

    const topic = await ForumTopic.findById(
      req.params.topicId
    );

    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    const {
      status,
      isPinned,
      approvalStatus,
      rejectionReason = "",
    } = req.validatedBody;

    const previousApprovalStatus =
      topic.approvalStatus ||
      "approved";

    const approvalStatusWasProvided =
      approvalStatus !== undefined;

    topic.status = status;
    topic.isPinned =
      Boolean(isPinned);

    if (approvalStatusWasProvided) {
      topic.approvalStatus =
        approvalStatus;

      topic.rejectionReason =
        approvalStatus === "rejected"
          ? rejectionReason.trim()
          : "";

      if (
        approvalStatus === "pending"
      ) {
        topic.reviewedBy = null;
        topic.reviewedAt = null;
      } else {
        topic.reviewedBy =
          req.user._id;

        topic.reviewedAt =
          new Date();
      }
    }

    if (
      topic.approvalStatus !==
      "approved"
    ) {
      topic.isPinned = false;
    }

    await topic.save();

    const approvalChanged =
      approvalStatusWasProvided &&
      previousApprovalStatus !==
        topic.approvalStatus;

    if (
      approvalChanged &&
      [
        "approved",
        "rejected",
      ].includes(
        topic.approvalStatus
      )
    ) {
      const isApproved =
        topic.approvalStatus ===
        "approved";

      await createForumNotification({
        recipient: topic.author,

        actor:
          req.user?._id ||
          req.user?.id,

        type: isApproved
          ? "topic_approved"
          : "topic_rejected",

        topic: topic._id,

        title: isApproved
          ? "Forum konunuz onaylandı"
          : "Forum konunuz reddedildi",

        message: isApproved
          ? `“${topic.title}” başlıklı konunuz yayınlandı.`
          : `“${topic.title}” başlıklı konunuz reddedildi. Neden: ${topic.rejectionReason}`,

        link: isApproved
          ? `/forum/${topic.slug}`
          : "/hesabim/forum-hareketlerim",

        uniqueKey:
          `forum-topic-review:${topic._id}:` +
          `${topic.approvalStatus}:` +
          `${topic.reviewedAt.getTime()}`,
      });
    }

    await topic.populate([
      {
        path: "category",
        select:
          "name slug color isActive",
      },
      {
        path: "author",
        select:
          "firstName lastName email role",
      },
    ]);

    const serializedTopic = {
      ...topic.toObject(),
      authorInfo:
        serializeTopicAuthor(topic),
    };

    delete serializedTopic.author;

    const responseMessage =
      approvalChanged
        ? topic.approvalStatus ===
          "approved"
          ? "Forum konusu onaylandı ve yayınlandı."
          : "Forum konusu reddedildi."
        : "Forum konusu moderasyon ayarları güncellendi.";

    res.status(200).json({
      success: true,
      message: responseMessage,

      data: {
        topic: serializedTopic,
      },
    });
  });


  /**
 * GET /api/admin/forum/topics/:topicId/replies
 */
export const getAdminForumTopicReplies =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.topicId
    );

    const topicExists =
      await ForumTopic.exists({
        _id: req.params.topicId,
      });

    if (!topicExists) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    /*
     * Sayfalama yalnızca ana yanıtlar
     * üzerinden yapılır. Alt cevaplar
     * bağlı oldukları ana yanıtla gelir.
     */
    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = 20;
    const skip =
      (page - 1) * limit;

    const rootFilter = {
      topic: req.params.topicId,
      parentReply: null,
    };

    const [
      rootReplies,
      totalRootReplies,
      statusResults,
    ] = await Promise.all([
      ForumReply.find(rootFilter)
        .populate({
          path: "author",
          select:
            "firstName lastName email role",
        })
        .populate({
          path: "replyToUser",
          select:
            "firstName lastName email role",
        })
        .sort({
          createdAt: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ForumReply.countDocuments(
        rootFilter
      ),

      ForumReply.aggregate([
        {
          $match: {
            topic:
              new mongoose.Types.ObjectId(
                req.params.topicId
              ),
          },
        },
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },
      ]),
    ]);

    const rootReplyIds =
      rootReplies.map(
        (reply) => reply._id
      );

    const childReplies =
      rootReplyIds.length > 0
        ? await ForumReply.find({
            topic:
              req.params.topicId,

            parentReply: {
              $in: rootReplyIds,
            },
          })
            .populate({
              path: "author",
              select:
                "firstName lastName email role",
            })
            .populate({
              path: "replyToUser",
              select:
                "firstName lastName email role",
            })
            .sort({
              createdAt: 1,
            })
            .lean()
        : [];

    const childrenByRoot =
      new Map();

    childReplies.forEach(
      (reply) => {
        const rootId = String(
          reply.parentReply
        );

        const currentChildren =
          childrenByRoot.get(
            rootId
          ) || [];

        currentChildren.push(
          serializeAdminReply(reply)
        );

        childrenByRoot.set(
          rootId,
          currentChildren
        );
      }
    );

    const replies =
      rootReplies.map(
        (reply) => ({
          ...serializeAdminReply(
            reply
          ),

          childReplies:
            childrenByRoot.get(
              String(reply._id)
            ) || [],
        })
      );

    const statusMap = new Map(
      statusResults.map(
        (item) => [
          item._id,
          item.count,
        ]
      )
    );

    const totalPages =
      Math.max(
        Math.ceil(
          totalRootReplies / limit
        ),
        1
      );

    res.status(200).json({
      success: true,

      data: {
        replies,

        statusCounts: {
          published:
            statusMap.get(
              "published"
            ) || 0,

          hidden:
            statusMap.get(
              "hidden"
            ) || 0,

          deleted:
            statusMap.get(
              "deleted"
            ) || 0,
        },

        pagination: {
          page,
          limit,
          totalRootReplies,
          totalPages,
          hasPreviousPage:
            page > 1,

          hasNextPage:
            page < totalPages,
        },
      },
    });
  });



  /**
 * PATCH /api/admin/forum/replies/:replyId/moderation
 */
export const updateAdminForumReplyModeration =
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.replyId);

    const reply = await ForumReply.findById(
      req.params.replyId
    );

    if (!reply) {
      throw new AppError(
        "Forum yanıtı bulunamadı.",
        404
      );
    }

    reply.status =
      req.validatedBody.status;

    await reply.save();

    const topicStats =
      await recalculateTopicReplyStats(
        reply.topic
      );

    await reply.populate([
      {
        path: "author",
        select:
          "firstName lastName email role",
      },
      {
        path: "replyToUser",
        select:
          "firstName lastName email role",
      },
    ]);

    res.status(200).json({
      success: true,

      message:
        reply.status === "published"
          ? "Forum yanıtı yeniden yayınlandı."
          : reply.status === "hidden"
            ? "Forum yanıtı gizlendi."
            : "Forum yanıtı silinmiş olarak işaretlendi.",

      data: {
        reply:
          serializeAdminReply(reply),

        topicStats,
      },
    });
  });