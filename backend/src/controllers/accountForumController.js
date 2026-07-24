import mongoose from "mongoose";

import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAuthenticatedUserId = (req) => {
  const userId =
    req.user?._id ||
    req.user?.id;

  if (
    !userId ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new AppError(
      "Kullanıcı bilgisi doğrulanamadı.",
      401
    );
  }

  return new mongoose.Types.ObjectId(
    userId
  );
};

const getPaginationValues = (
  query,
  defaultLimit = 10
) => {
  const page = Math.max(
    Number.parseInt(
      query.page,
      10
    ) || 1,
    1
  );

  const limit = Math.min(
    Math.max(
      Number.parseInt(
        query.limit,
        10
      ) || defaultLimit,
      1
    ),
    30
  );

  return {
    page,
    limit,
    skip:
      (page - 1) * limit,
  };
};

const getUserName = (
  user,
  fallbackName = "Forum Üyesi"
) => {
  if (!user) {
    return fallbackName;
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    fallbackName
  );
};

/**
 * GET /api/account/forum/overview
 */
export const getMyForumOverview =
  asyncHandler(async (req, res) => {
    const userId =
      getAuthenticatedUserId(req);

    const [
      topicCount,
      openTopicCount,
      lockedTopicCount,
      hiddenTopicCount,
      replyCount,
      publishedReplyCount,
      hiddenReplyCount,
      deletedReplyCount,
    ] = await Promise.all([
      ForumTopic.countDocuments({
        author: userId,
      }),

      ForumTopic.countDocuments({
        author: userId,
        status: "open",
      }),

      ForumTopic.countDocuments({
        author: userId,
        status: "locked",
      }),

      ForumTopic.countDocuments({
        author: userId,
        status: "hidden",
      }),

      ForumReply.countDocuments({
        author: userId,
      }),

      ForumReply.countDocuments({
        author: userId,
        status: "published",
      }),

      ForumReply.countDocuments({
        author: userId,
        status: "hidden",
      }),

      ForumReply.countDocuments({
        author: userId,
        status: "deleted",
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        overview: {
          topicCount,
          openTopicCount,
          lockedTopicCount,
          hiddenTopicCount,
          replyCount,
          publishedReplyCount,
          hiddenReplyCount,
          deletedReplyCount,
        },
      },
    });
  });

/**
 * GET /api/account/forum/topics
 */
export const getMyForumTopics =
  asyncHandler(async (req, res) => {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page,
      limit,
      skip,
    } = getPaginationValues(
      req.query
    );

    const status = String(
      req.query.status || ""
    ).trim();

    const filter = {
      author: userId,
    };

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

    const [
      topics,
      totalTopics,
    ] = await Promise.all([
      ForumTopic.find(filter)
        .populate({
          path: "category",
          select:
            "name slug color isActive",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ForumTopic.countDocuments(
        filter
      ),
    ]);

    const totalPages =
      Math.max(
        Math.ceil(
          totalTopics / limit
        ),
        1
      );

    res.status(200).json({
      success: true,

      data: {
        topics,

        pagination: {
          page,
          limit,
          totalTopics,
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
 * GET /api/account/forum/replies
 */
export const getMyForumReplies =
  asyncHandler(async (req, res) => {
    const userId =
      getAuthenticatedUserId(req);

    const {
      page,
      limit,
      skip,
    } = getPaginationValues(
      req.query
    );

    const status = String(
      req.query.status || ""
    ).trim();

    const filter = {
      author: userId,
    };

    if (
      [
        "published",
        "hidden",
        "deleted",
      ].includes(status)
    ) {
      filter.status = status;
    }

    const [
      replies,
      totalReplies,
    ] = await Promise.all([
      ForumReply.find(filter)
        .populate({
          path: "topic",

          select:
            "title slug status category createdAt",

          populate: {
            path: "category",
            select:
              "name slug color",
          },
        })
        .populate({
          path: "replyToUser",
          select:
            "firstName lastName",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ForumReply.countDocuments(
        filter
      ),
    ]);

    const serializedReplies =
      replies.map((reply) => ({
        ...reply,

        isChildReply:
          Boolean(
            reply.parentReply
          ),

        replyTargetName:
          reply.replyToReply
            ? getUserName(
                reply.replyToUser,
                reply.replyToName ||
                  "Forum Üyesi"
              )
            : "",

        replyToUser:
          undefined,
      }));

    const totalPages =
      Math.max(
        Math.ceil(
          totalReplies / limit
        ),
        1
      );

    res.status(200).json({
      success: true,

      data: {
        replies:
          serializedReplies,

        pagination: {
          page,
          limit,
          totalReplies,
          totalPages,
          hasPreviousPage:
            page > 1,
          hasNextPage:
            page < totalPages,
        },
      },
    });
  });