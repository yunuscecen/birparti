import mongoose from "mongoose";

import ForumReport from "../models/ForumReport.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedStatuses = [
  "pending",
  "reviewed",
  "dismissed",
  "action_taken",
];

const allowedTargetTypes = [
  "topic",
  "reply",
];

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

const serializeForumReport = (
  report
) => {
  const serialized =
    typeof report.toObject === "function"
      ? report.toObject()
      : { ...report };

  const topicAvailable =
    serialized.topic &&
    [
      "open",
      "locked",
    ].includes(
      serialized.topic.status
    );

  const replyAvailable =
    serialized.targetType ===
      "reply" &&
    serialized.reply &&
    serialized.reply.status ===
      "published";

  let publicLink = "";

  if (
    serialized.targetType ===
      "topic" &&
    topicAvailable
  ) {
    publicLink =
      `/forum/${serialized.topic.slug}`;
  }

  if (
    serialized.targetType ===
      "reply" &&
    topicAvailable &&
    replyAvailable
  ) {
    publicLink =
      `/forum/${serialized.topic.slug}` +
      `#yanit-${serialized.reply._id}`;
  }

  return {
    id: serialized._id,
    targetType:
      serialized.targetType,
    reason:
      serialized.reason,
    description:
      serialized.description || "",
    status:
      serialized.status,
    createdAt:
      serialized.createdAt,
    updatedAt:
      serialized.updatedAt,
    reviewedAt:
      serialized.reviewedAt,
    publicLink,

    topic: serialized.topic
      ? {
          id:
            serialized.topic._id,
          title:
            serialized.topic.title,
          slug:
            serialized.topic.slug,
          status:
            serialized.topic.status,
          category:
            serialized.topic
              .category || null,
        }
      : null,

    reply: serialized.reply
      ? {
          id:
            serialized.reply._id,
          body:
            serialized.reply.body,
          status:
            serialized.reply.status,
          createdAt:
            serialized.reply
              .createdAt,
        }
      : null,
  };
};

/**
 * GET /api/account/forum/reports
 */
export const getMyForumReports =
  asyncHandler(async (req, res) => {
    const userId =
      getAuthenticatedUserId(req);

    const page = Math.max(
      Number.parseInt(
        req.query.page,
        10
      ) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(
          req.query.limit,
          10
        ) || 10,
        1
      ),
      30
    );

    const status = String(
      req.query.status || ""
    ).trim();

    const targetType = String(
      req.query.targetType || ""
    ).trim();

    const filter = {
      reporter: userId,
    };

    if (
      allowedStatuses.includes(
        status
      )
    ) {
      filter.status = status;
    }

    if (
      allowedTargetTypes.includes(
        targetType
      )
    ) {
      filter.targetType =
        targetType;
    }

    const skip =
      (page - 1) * limit;

    const [
      reports,
      totalReports,
      statusResults,
    ] = await Promise.all([
      ForumReport.find(filter)
        .populate({
          path: "topic",
          select:
            "title slug status category",

          populate: {
            path: "category",
            select:
              "name slug color",
          },
        })
        .populate({
          path: "reply",
          select:
            "body status createdAt",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      ForumReport.countDocuments(
        filter
      ),

      ForumReport.aggregate([
        {
          $match: {
            reporter: userId,
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

    const statusMap =
      new Map(
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
          totalReports / limit
        ),
        1
      );

    res.status(200).json({
      success: true,

      data: {
        reports:
          reports.map(
            serializeForumReport
          ),

        overview: {
          total:
            Array.from(
              statusMap.values()
            ).reduce(
              (
                total,
                current
              ) =>
                total +
                current,
              0
            ),

          pending:
            statusMap.get(
              "pending"
            ) || 0,

          reviewed:
            statusMap.get(
              "reviewed"
            ) || 0,

          dismissed:
            statusMap.get(
              "dismissed"
            ) || 0,

          actionTaken:
            statusMap.get(
              "action_taken"
            ) || 0,
        },

        pagination: {
          page,
          limit,
          totalReports,
          totalPages,
          hasPreviousPage:
            page > 1,
          hasNextPage:
            page < totalPages,
        },
      },
    });
  });