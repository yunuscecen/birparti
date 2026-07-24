import mongoose from "mongoose";

import ForumNotification from "../models/ForumNotification.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getUserId = (req) => {
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

const serializeActor = (actor) => {
  if (!actor) {
    return null;
  }

  const fullName = [
    actor.firstName,
    actor.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return {
    id: actor._id,
    name:
      fullName ||
      "Bir Parti",
    role:
      actor.role ||
      null,
  };
};

/**
 * GET /api/account/forum/notifications
 */
export const getMyForumNotifications =
  asyncHandler(async (req, res) => {
    const userId =
      getUserId(req);

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

    const unreadOnly =
      String(
        req.query.unreadOnly || ""
      ) === "true";

    const filter = {
      recipient:
        userId,
    };

    if (unreadOnly) {
      filter.isRead = false;
    }

    const skip =
      (page - 1) * limit;

    const [
      notifications,
      totalNotifications,
      unreadCount,
    ] = await Promise.all([
      ForumNotification.find(
        filter
      )
        .populate({
          path: "actor",
          select:
            "firstName lastName role",
        })
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ForumNotification.countDocuments(
        filter
      ),

      ForumNotification.countDocuments({
        recipient:
          userId,

        isRead:
          false,
      }),
    ]);

    const serializedNotifications =
      notifications.map(
        (notification) => {
          const serialized = {
            ...notification,

            actorInfo:
              serializeActor(
                notification.actor
              ),
          };

          delete serialized.actor;
          delete serialized.recipient;

          return serialized;
        }
      );

    const totalPages =
      Math.max(
        Math.ceil(
          totalNotifications /
            limit
        ),
        1
      );

    res.status(200).json({
      success: true,

      data: {
        notifications:
          serializedNotifications,

        unreadCount,

        pagination: {
          page,
          limit,
          totalNotifications,
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
 * PATCH /api/account/forum/notifications/read-all
 */
export const markAllForumNotificationsRead =
  asyncHandler(async (req, res) => {
    const userId =
      getUserId(req);

    await ForumNotification.updateMany(
      {
        recipient:
          userId,

        isRead:
          false,
      },
      {
        $set: {
          isRead:
            true,

          readAt:
            new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,

      message:
        "Tüm forum bildirimleri okundu olarak işaretlendi.",
    });
  });

/**
 * PATCH /api/account/forum/notifications/:notificationId/read
 */
export const markForumNotificationRead =
  asyncHandler(async (req, res) => {
    const userId =
      getUserId(req);

    const {
      notificationId,
    } = req.params;

    if (
      !mongoose.isValidObjectId(
        notificationId
      )
    ) {
      throw new AppError(
        "Geçersiz bildirim kimliği.",
        400
      );
    }

    const notification =
      await ForumNotification.findOne({
        _id:
          notificationId,

        recipient:
          userId,
      });

    if (!notification) {
      throw new AppError(
        "Forum bildirimi bulunamadı.",
        404
      );
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt =
        new Date();

      await notification.save();
    }

    res.status(200).json({
      success: true,

      message:
        "Forum bildirimi okundu olarak işaretlendi.",

      data: {
        notification,
      },
    });
  });