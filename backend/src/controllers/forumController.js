import ForumCategory from "../models/ForumCategory.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const publicTopicStatuses = ["open", "locked"];

const escapeRegExp = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: user._id,
    name:
      fullName ||
      fallbackName ||
      "Forum Üyesi",
    role: user.role || "member",
  };
};

const serializeAuthor = (record) => {
  return serializeUser(
    record.author,
    record.authorName ||
      "Forum Üyesi"
  );
};

const serializeReply = (reply) => {
  const serialized = {
    ...reply,

    authorInfo:
      serializeAuthor(reply),

    replyToUserInfo:
      reply.replyToReply
        ? serializeUser(
            reply.replyToUser,
            reply.replyToName ||
              "Forum Üyesi"
          )
        : null,
  };

  delete serialized.author;
  delete serialized.replyToUser;

  return serialized;
};

/**
 * GET /api/forum-categories
 */
export const getPublicForumCategories = asyncHandler(
  async (req, res) => {
    const categories = await ForumCategory.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
       const topicCount = await ForumTopic.countDocuments({
  category: category._id,
  approvalStatus: "approved",

  status: {
    $in: publicTopicStatuses,
  },
});

        return {
          ...category,
          topicCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        categories: categoriesWithCounts,
      },
    });
  }
);

/**
 * GET /api/forum-topics
 */
export const getPublicForumTopics = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 15, 1),
      40
    );

    const search = String(req.query.search || "").trim();

    const categorySlug = String(
      req.query.category || ""
    ).trim();

    const filter = {
  approvalStatus: "approved",

  status: {
    $in: publicTopicStatuses,
  },
};

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
      ];
    }

    if (categorySlug) {
      const category = await ForumCategory.findOne({
        slug: categorySlug,
        isActive: true,
      }).select("_id");

      if (!category) {
        return res.status(200).json({
          success: true,
          data: {
            topics: [],
            pagination: {
              page: 1,
              limit,
              totalTopics: 0,
              totalPages: 1,
            },
          },
        });
      }

      filter.category = category._id;
    }

    const skip = (page - 1) * limit;

    const [topics, totalTopics] = await Promise.all([
      ForumTopic.find(filter)
        .populate({
          path: "category",
          select: "name slug color",
        })
        .populate({
          path: "author",
          select: "firstName lastName role",
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

    res.status(200).json({
      success: true,
      data: {
        topics: topics.map((topic) => ({
          ...topic,
          authorInfo: serializeAuthor(topic),
          author: undefined,
        })),

        pagination: {
          page,
          limit,
          totalTopics,
          totalPages: Math.max(
            Math.ceil(totalTopics / limit),
            1
          ),
        },
      },
    });
  }
);

export const getPublicForumTopicBySlug = asyncHandler(
  async (req, res) => {
    const slug = String(
      req.params.slug || ""
    )
      .trim()
      .toLowerCase();

    const replyPage = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    /*
     * Sayfalama ana yanıtlar üzerinden yapılır.
     * Alt cevaplar kendi ana yanıtlarıyla beraber
     * getirilir.
     */
    const replyLimit = 20;
    const replySkip =
      (replyPage - 1) * replyLimit;

    const topic =
      await ForumTopic.findOneAndUpdate(
        {
  slug,
  approvalStatus: "approved",

  status: {
    $in: ["open", "locked"],
  },
},
        {
          $inc: {
            viewCount: 1,
          },
        },
        {
          new: true,
        }
      )
        .populate({
          path: "category",
          select:
            "name slug color",
        })
        .populate({
          path: "author",
          select:
            "firstName lastName role",
        })
        .lean();

    if (!topic) {
      throw new AppError(
        "Forum konusu bulunamadı.",
        404
      );
    }

    const rootReplyFilter = {
      topic: topic._id,
      status: "published",
      parentReply: null,
    };

    const [
  rootReplies,
  totalRootReplies,
] = await Promise.all([
  ForumReply.find(
    rootReplyFilter
  )
    .populate({
      path: "author",
      select:
        "firstName lastName role",
    })
    .sort({
      createdAt: 1,
    })
    .skip(replySkip)
    .limit(replyLimit)
    .lean(),

  ForumReply.countDocuments(
    rootReplyFilter
  ),
]);

const rootReplyIds =
  rootReplies.map(
    (reply) => reply._id
  );

/*
 * Public tarafta görünür olan tüm ana
 * yanıtların kimlikleri alınır.
 */
const allPublishedRootIds =
  await ForumReply.find({
    topic: topic._id,
    status: "published",
    parentReply: null,
  }).distinct("_id");

const childReplies =
  rootReplyIds.length > 0
    ? await ForumReply.find({
        topic: topic._id,
        status: "published",

        parentReply: {
          $in: rootReplyIds,
        },
      })
        .populate({
          path: "author",
          select:
            "firstName lastName role",
        })
        .populate({
          path: "replyToUser",
          select:
            "firstName lastName role",
        })
        .sort({
          createdAt: 1,
        })
        .lean()
    : [];

const totalVisibleChildReplies =
  allPublishedRootIds.length > 0
    ? await ForumReply.countDocuments({
        topic: topic._id,
        status: "published",

        parentReply: {
          $in:
            allPublishedRootIds,
        },
      })
    : 0;

const totalReplies =
  totalRootReplies +
  totalVisibleChildReplies;

    const childrenByRoot =
      new Map();

    childReplies.forEach(
      (reply) => {
        const rootId = String(
          reply.parentReply
        );

        const currentChildren =
          childrenByRoot.get(rootId) ||
          [];

        currentChildren.push(
          serializeReply(reply)
        );

        childrenByRoot.set(
          rootId,
          currentChildren
        );
      }
    );

    const serializedRootReplies =
      rootReplies.map(
        (reply) => ({
          ...serializeReply(reply),

          childReplies:
            childrenByRoot.get(
              String(reply._id)
            ) || [],
        })
      );

    const serializedTopic = {
      ...topic,

      authorInfo:
        serializeAuthor(topic),
    };

    delete serializedTopic.author;

    res.status(200).json({
      success: true,

      data: {
        topic: serializedTopic,

        replies:
          serializedRootReplies,

        pagination: {
          page: replyPage,
          limit: replyLimit,

          /*
           * Tüm cevaplar; ana ve alt cevaplar.
           */
          totalReplies,

          /*
           * Sayfalama yalnızca ana yanıtlarla
           * yapıldığı için ayrıca gönderilir.
           */
          totalRootReplies,

          totalPages: Math.max(
            Math.ceil(
              totalRootReplies /
                replyLimit
            ),
            1
          ),
        },
      },
    });
  }
);