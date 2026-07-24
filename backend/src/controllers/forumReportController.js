import mongoose from "mongoose";

import ForumReport from "../models/ForumReport.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const publicTopicStatuses = [
  "open",
  "locked",
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

const isSameUser = (
  firstUserId,
  secondUserId
) => {
  if (
    !firstUserId ||
    !secondUserId
  ) {
    return false;
  }

  return (
    String(firstUserId) ===
    String(secondUserId)
  );
};

/**
 * POST /api/forum-reports
 */
export const createForumReport =
  asyncHandler(async (req, res) => {
    const reporterId =
      getAuthenticatedUserId(req);

    const {
      targetType,
      targetId,
      reason,
      description,
    } = req.validatedBody;

    let topic;
    let reply = null;
    let targetAuthor = null;
    let targetKey;

    if (targetType === "topic") {
      topic =
        await ForumTopic.findOne({
          _id: targetId,

          status: {
            $in:
              publicTopicStatuses,
          },
        }).select(
          "_id author title slug status"
        );

      if (!topic) {
        throw new AppError(
          "Bildirmek istediğiniz forum konusu bulunamadı.",
          404
        );
      }

      targetAuthor =
        topic.author || null;

      targetKey =
        `topic:${topic._id}`;
    } else {
      reply =
        await ForumReply.findOne({
          _id: targetId,
          status: "published",
        }).select(
          "_id topic author body status"
        );

      if (!reply) {
        throw new AppError(
          "Bildirmek istediğiniz forum yanıtı bulunamadı.",
          404
        );
      }

      topic =
        await ForumTopic.findOne({
          _id: reply.topic,

          status: {
            $in:
              publicTopicStatuses,
          },
        }).select(
          "_id author title slug status"
        );

      if (!topic) {
        throw new AppError(
          "Yanıtın bağlı olduğu forum konusu artık erişilebilir değil.",
          404
        );
      }

      targetAuthor =
        reply.author || null;

      targetKey =
        `reply:${reply._id}`;
    }

    if (
      isSameUser(
        reporterId,
        targetAuthor
      )
    ) {
      throw new AppError(
        "Kendi içeriğinizi bildiremezsiniz.",
        400
      );
    }

    const existingReport =
      await ForumReport.exists({
        reporter:
          reporterId,
        targetKey,
      });

    if (existingReport) {
      throw new AppError(
        "Bu içeriği daha önce bildirdiniz.",
        409
      );
    }

    try {
      const report =
        await ForumReport.create({
          reporter:
            reporterId,

          targetType,
          targetKey,

          topic:
            topic._id,

          reply:
            reply?._id ||
            null,

          targetAuthor,

          reason,
          description,

          status:
            "pending",
        });

      res.status(201).json({
        success: true,

        message:
          "Bildiriminiz inceleme için gönderildi.",

        data: {
          report: {
            id:
              report._id,

            status:
              report.status,

            targetType:
              report.targetType,

            createdAt:
              report.createdAt,
          },
        },
      });
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError(
          "Bu içeriği daha önce bildirdiniz.",
          409
        );
      }

      throw error;
    }
  });