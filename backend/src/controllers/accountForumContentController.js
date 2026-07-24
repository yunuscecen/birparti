import mongoose from "mongoose";

import ForumCategory from "../models/ForumCategory.js";
import ForumReply from "../models/ForumReply.js";
import ForumTopic from "../models/ForumTopic.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const editableTopicStatuses =
  new Set([
    "open",
    "locked",
  ]);

const editableReplyStatuses =
  new Set([
    "published",
  ]);

const ensureObjectId = (
  id,
  message =
    "Geçersiz kayıt kimliği."
) => {
  if (
    !mongoose.isValidObjectId(
      id
    )
  ) {
    throw new AppError(
      message,
      400
    );
  }
};

const getAuthenticatedUserId = (
  req
) => {
  const userId =
    req.user?._id ||
    req.user?.id;

  if (
    !userId ||
    !mongoose.isValidObjectId(
      userId
    )
  ) {
    throw new AppError(
      "Kullanıcı bilgisi doğrulanamadı.",
      401
    );
  }

  return userId;
};

const ensureTopicEditable = (
  topic
) => {
  if (
    !editableTopicStatuses.has(
      topic.status
    )
  ) {
    throw new AppError(
      "Bu forum konusu mevcut durumu nedeniyle düzenlenemez.",
      409
    );
  }
};

const ensureReplyEditable = (
  reply
) => {
  if (
    !editableReplyStatuses.has(
      reply.status
    )
  ) {
    throw new AppError(
      "Bu forum yanıtı mevcut durumu nedeniyle düzenlenemez.",
      409
    );
  }

  if (
    !reply.topic ||
    !editableTopicStatuses.has(
      reply.topic.status
    )
  ) {
    throw new AppError(
      "Yanıtın bağlı olduğu forum konusu düzenlemeye uygun değil.",
      409
    );
  }
};

/**
 * GET /api/account/forum/topics/:topicId/edit
 */
export const getMyForumTopicForEdit =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.topicId,
        "Geçersiz forum konusu kimliği."
      );

      const userId =
        getAuthenticatedUserId(
          req
        );

      const topic =
        await ForumTopic.findOne({
          _id:
            req.params.topicId,

          author:
            userId,
        })
          .populate({
            path: "category",
            select:
              "name slug color isActive",
          })
          .lean();

      if (!topic) {
        throw new AppError(
          "Size ait forum konusu bulunamadı.",
          404
        );
      }

      ensureTopicEditable(
        topic
      );

      res.status(200).json({
        success: true,

        data: {
          topic,
        },
      });
    }
  );

/**
 * PATCH /api/account/forum/topics/:topicId/edit
 */
export const updateMyForumTopic =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.topicId,
        "Geçersiz forum konusu kimliği."
      );

      const userId =
        getAuthenticatedUserId(
          req
        );

      const topic =
        await ForumTopic.findOne({
          _id:
            req.params.topicId,

          author:
            userId,
        });

      if (!topic) {
        throw new AppError(
          "Size ait forum konusu bulunamadı.",
          404
        );
      }

      ensureTopicEditable(
        topic
      );

      const {
        title,
        body,
        category,
      } = req.validatedBody;

      const selectedCategory =
        await ForumCategory.findOne({
          _id:
            category,

          isActive:
            true,
        }).select(
          "_id name slug color"
        );

      if (!selectedCategory) {
        throw new AppError(
          "Seçtiğiniz forum kategorisi bulunamadı veya aktif değil.",
          404
        );
      }

      topic.title =
        title;

      topic.body =
        body;

      topic.category =
        selectedCategory._id;

      topic.isEdited =
        true;

      topic.editedAt =
        new Date();

      /*
       * Slug bilerek değiştirilmiyor.
       * Eski forum ve bildirim bağlantıları
       * çalışmaya devam edecek.
       */
      await topic.save();

      await topic.populate({
        path: "category",
        select:
          "name slug color isActive",
      });

      res.status(200).json({
        success: true,

        message:
          "Forum konusu güncellendi.",

        data: {
          topic,
        },
      });
    }
  );

/**
 * GET /api/account/forum/replies/:replyId/edit
 */
export const getMyForumReplyForEdit =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.replyId,
        "Geçersiz forum yanıtı kimliği."
      );

      const userId =
        getAuthenticatedUserId(
          req
        );

      const reply =
        await ForumReply.findOne({
          _id:
            req.params.replyId,

          author:
            userId,
        })
          .populate({
            path: "topic",
            select:
              "title slug status",
          })
          .lean();

      if (!reply) {
        throw new AppError(
          "Size ait forum yanıtı bulunamadı.",
          404
        );
      }

      ensureReplyEditable(
        reply
      );

      res.status(200).json({
        success: true,

        data: {
          reply,
        },
      });
    }
  );

/**
 * PATCH /api/account/forum/replies/:replyId/edit
 */
export const updateMyForumReply =
  asyncHandler(
    async (req, res) => {
      ensureObjectId(
        req.params.replyId,
        "Geçersiz forum yanıtı kimliği."
      );

      const userId =
        getAuthenticatedUserId(
          req
        );

      const reply =
        await ForumReply.findOne({
          _id:
            req.params.replyId,

          author:
            userId,
        }).populate({
          path: "topic",
          select:
            "title slug status",
        });

      if (!reply) {
        throw new AppError(
          "Size ait forum yanıtı bulunamadı.",
          404
        );
      }

      ensureReplyEditable(
        reply
      );

      reply.body =
        req.validatedBody.body;

      reply.isEdited =
        true;

      reply.editedAt =
        new Date();

      await reply.save();

      res.status(200).json({
        success: true,

        message:
          "Forum yanıtı güncellendi.",

        data: {
          reply,
        },
      });
    }
  );