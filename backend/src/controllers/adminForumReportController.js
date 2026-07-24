import mongoose from "mongoose";

import ForumReport from "../models/ForumReport.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import User from "../models/User.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const reportStatuses = [
  "pending",
  "reviewed",
  "dismissed",
  "action_taken",
];

const reportReasons = [
  "spam",
  "harassment",
  "hate",
  "misinformation",
  "personal_data",
  "other",
];

const targetTypes = [
  "topic",
  "reply",
];

const escapeRegExp = (value = "") => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const ensureObjectId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(
      "Geçersiz bildirim kimliği.",
      400
    );
  }
};

const getUserFullName = (
  user,
  fallbackName = "Kullanıcı"
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
    user.email ||
    fallbackName
  );
};

const serializeUser = (
  user,
  fallbackName = "Kullanıcı"
) => {
  if (!user) {
    return {
      id: null,
      name: fallbackName,
      email: "",
      role: null,
    };
  }

  return {
    id: user._id,
    name: getUserFullName(
      user,
      fallbackName
    ),
    email: user.email || "",
    role: user.role || null,
  };
};

const serializeReport = (report) => {
  const serialized =
    typeof report.toObject === "function"
      ? report.toObject()
      : { ...report };

  serialized.reporterInfo =
    serializeUser(
      report.reporter,
      "Bilinmeyen kullanıcı"
    );

  serialized.targetAuthorInfo =
    serializeUser(
      report.targetAuthor,
      "Bilinmeyen kullanıcı"
    );

  serialized.reviewedByInfo =
    report.reviewedBy
      ? serializeUser(
          report.reviewedBy,
          "Yönetici"
        )
      : null;

  delete serialized.reporter;
  delete serialized.targetAuthor;
  delete serialized.reviewedBy;

  return serialized;
};

/**
 * GET /api/admin/forum/reports/overview
 */
export const getAdminForumReportOverview =
  asyncHandler(async (req, res) => {
    const [
      totalReports,
      pendingReports,
      reviewedReports,
      dismissedReports,
      actionTakenReports,
      topicReports,
      replyReports,
    ] = await Promise.all([
      ForumReport.countDocuments(),

      ForumReport.countDocuments({
        status: "pending",
      }),

      ForumReport.countDocuments({
        status: "reviewed",
      }),

      ForumReport.countDocuments({
        status: "dismissed",
      }),

      ForumReport.countDocuments({
        status: "action_taken",
      }),

      ForumReport.countDocuments({
        targetType: "topic",
      }),

      ForumReport.countDocuments({
        targetType: "reply",
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        overview: {
          totalReports,
          pendingReports,
          reviewedReports,
          dismissedReports,
          actionTakenReports,
          topicReports,
          replyReports,
        },
      },
    });
  });

/**
 * GET /api/admin/forum/reports
 */
export const getAdminForumReports =
  asyncHandler(async (req, res) => {
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
        ) || 15,
        1
      ),
      50
    );

    const search = String(
      req.query.search || ""
    ).trim();

    const status = String(
      req.query.status || ""
    ).trim();

    const targetType = String(
      req.query.targetType || ""
    ).trim();

    const reason = String(
      req.query.reason || ""
    ).trim();

    const conditions = [];

    if (
      reportStatuses.includes(
        status
      )
    ) {
      conditions.push({
        status,
      });
    }

    if (
      targetTypes.includes(
        targetType
      )
    ) {
      conditions.push({
        targetType,
      });
    }

    if (
      reportReasons.includes(
        reason
      )
    ) {
      conditions.push({
        reason,
      });
    }

    if (search) {
      const safeSearch =
        escapeRegExp(search);

      const [
        matchingUsers,
        matchingTopics,
        matchingReplies,
      ] = await Promise.all([
        User.find({
          $or: [
            {
              firstName: {
                $regex: safeSearch,
                $options: "i",
              },
            },
            {
              lastName: {
                $regex: safeSearch,
                $options: "i",
              },
            },
            {
              email: {
                $regex: safeSearch,
                $options: "i",
              },
            },
          ],
        })
          .select("_id")
          .limit(500)
          .lean(),

        ForumTopic.find({
          $or: [
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
          ],
        })
          .select("_id")
          .limit(500)
          .lean(),

        ForumReply.find({
          body: {
            $regex: safeSearch,
            $options: "i",
          },
        })
          .select("_id")
          .limit(500)
          .lean(),
      ]);

      const userIds =
        matchingUsers.map(
          (user) => user._id
        );

      const topicIds =
        matchingTopics.map(
          (topic) => topic._id
        );

      const replyIds =
        matchingReplies.map(
          (reply) => reply._id
        );

      conditions.push({
        $or: [
          {
            reporter: {
              $in: userIds,
            },
          },
          {
            targetAuthor: {
              $in: userIds,
            },
          },
          {
            topic: {
              $in: topicIds,
            },
          },
          {
            reply: {
              $in: replyIds,
            },
          },
          {
            description: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            resolutionNote: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ],
      });
    }

    const filter =
      conditions.length > 0
        ? {
            $and: conditions,
          }
        : {};

    const skip =
      (page - 1) * limit;

    const [
      reports,
      totalReports,
    ] = await Promise.all([
      ForumReport.find(filter)
        .populate({
          path: "reporter",
          select:
            "firstName lastName email role",
        })
        .populate({
          path: "targetAuthor",
          select:
            "firstName lastName email role",
        })
        .populate({
          path: "reviewedBy",
          select:
            "firstName lastName email role",
        })
        .populate({
          path: "topic",
          select:
            "title slug body status category authorName createdAt",

          populate: {
            path: "category",
            select:
              "name slug color",
          },
        })
        .populate({
          path: "reply",
          select:
            "body status parentReply replyToName createdAt",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      ForumReport.countDocuments(
        filter
      ),
    ]);

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
        reports: reports.map(
          serializeReport
        ),

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

/**
 * PATCH /api/admin/forum/reports/:reportId
 */
export const updateAdminForumReport =
  asyncHandler(async (req, res) => {
    ensureObjectId(
      req.params.reportId
    );

    const report =
      await ForumReport.findById(
        req.params.reportId
      );

    if (!report) {
      throw new AppError(
        "Forum bildirimi bulunamadı.",
        404
      );
    }

    const {
      status,
      resolutionNote,
    } = req.validatedBody;

    const reviewerId =
      req.user?._id ||
      req.user?.id;

    if (
      !reviewerId ||
      !mongoose.isValidObjectId(
        reviewerId
      )
    ) {
      throw new AppError(
        "Yönetici bilgisi doğrulanamadı.",
        401
      );
    }

    report.status = status;
    report.resolutionNote =
      resolutionNote;

    if (status === "pending") {
      report.reviewedBy = null;
      report.reviewedAt = null;
    } else {
      report.reviewedBy =
        reviewerId;

      report.reviewedAt =
        new Date();
    }

    await report.save();

    await report.populate([
      {
        path: "reporter",
        select:
          "firstName lastName email role",
      },
      {
        path: "targetAuthor",
        select:
          "firstName lastName email role",
      },
      {
        path: "reviewedBy",
        select:
          "firstName lastName email role",
      },
      {
        path: "topic",
        select:
          "title slug body status category authorName createdAt",

        populate: {
          path: "category",
          select:
            "name slug color",
        },
      },
      {
        path: "reply",
        select:
          "body status parentReply replyToName createdAt",
      },
    ]);

    res.status(200).json({
      success: true,

      message:
        status === "pending"
          ? "Bildirim yeniden beklemeye alındı."
          : status === "reviewed"
            ? "Bildirim incelendi olarak işaretlendi."
            : status === "dismissed"
              ? "Bildirim reddedildi."
              : "Bildirim işlem yapıldı olarak kapatıldı.",

      data: {
        report:
          serializeReport(
            report
          ),
      },
    });
  });