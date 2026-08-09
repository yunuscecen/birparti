import mongoose from "mongoose";

import ForumTopic from "../models/ForumTopic.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const escapeRegExp = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const serializeAdminUser = (user) => ({
  id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: user.role,
  permissions: user.permissions || [],
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  emailVerifiedAt: user.emailVerifiedAt,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const findManagedUser = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError("Geçersiz kullanıcı kimliği.", 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  return user;
};

const ensureActorCanManageTarget = ({
  actor,
  target,
  allowSelf = false,
}) => {
  const isSelf =
    actor._id.toString() === target._id.toString();

  if (isSelf && !allowSelf) {
    throw new AppError(
      "Bu işlemi kendi hesabınız üzerinde gerçekleştiremezsiniz.",
      400
    );
  }

  if (
    actor.role !== "superAdmin" &&
    ["admin", "superAdmin"].includes(target.role)
  ) {
    throw new AppError(
      "Yönetici hesapları üzerinde işlem yapma yetkiniz yok.",
      403
    );
  }
};

/**
 * GET /api/admin/dashboard
 */
export const getAdminDashboard = asyncHandler(
  async (req, res) => {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      pendingUsers,
     verifiedUsers,
pendingForumTopicCount,
roleCounts,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        status: "active",
      }),

      User.countDocuments({
        status: "suspended",
      }),

      User.countDocuments({
        status: "pending",
      }),

      User.countDocuments({
        isEmailVerified: true,
      }),

      ForumTopic.countDocuments({
  approvalStatus: "pending",
}),

      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            count: -1,
          },
        },
      ]),

      User.find()
        .sort({
          createdAt: -1,
        })
        .limit(6)
        .lean(),
    ]);

    const roles = roleCounts.reduce((result, item) => {
      result[item._id] = item.count;
      return result;
    }, {});

    res.status(200).json({
      success: true,

      data: {
        statistics: {
          totalUsers,
          activeUsers,
          suspendedUsers,
          pendingUsers,
        verifiedUsers,
pendingForumTopicCount,
roles,
        },

        recentUsers: recentUsers.map(serializeAdminUser),
      },
    });
  }
);

/**
 * GET /api/admin/users
 */
export const getAdminUsers = asyncHandler(
  async (req, res) => {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 12,
        1
      ),
      50
    );

    const search = String(req.query.search || "").trim();
    const role = String(req.query.role || "").trim();
    const status = String(req.query.status || "").trim();

    const filter = {};

    if (search) {
      const safeSearch = escapeRegExp(search);

      filter.$or = [
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
      ];
    }

    const allowedRoles = [
      "member",
      "moderator",
      "contentEditor",
      "financeManager",
      "admin",
      "superAdmin",
    ];

    const allowedStatuses = [
      "active",
      "suspended",
      "pending",
    ];

    if (role && allowedRoles.includes(role)) {
      filter.role = role;
    }

    if (status && allowedStatuses.includes(status)) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.max(
      Math.ceil(totalUsers / limit),
      1
    );

    res.status(200).json({
      success: true,

      data: {
        users: users.map(serializeAdminUser),

        pagination: {
          page,
          limit,
          totalUsers,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        },
      },
    });
  }
);

/**
 * PATCH /api/admin/users/:userId/status
 */
export const updateUserStatus = asyncHandler(
  async (req, res) => {
    const user = await findManagedUser(
      req.params.userId
    );

    ensureActorCanManageTarget({
      actor: req.user,
      target: user,
    });

    user.status = req.validatedBody.status;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Kullanıcı durumu güncellendi.",

      data: {
        user: serializeAdminUser(user),
      },
    });
  }
);



/**
 * PATCH /api/admin/users/:userId/role
 * Yalnızca superAdmin.
 */
export const updateUserRole = asyncHandler(
  async (req, res) => {
    const user = await findManagedUser(
      req.params.userId
    );

    ensureActorCanManageTarget({
      actor: req.user,
      target: user,
    });

    user.role = req.validatedBody.role;

    await user.save({
      validateBeforeSave: false,
    });

    res.status(200).json({
      success: true,
      message: "Kullanıcı rolü güncellendi.",

      data: {
        user: serializeAdminUser(user),
      },
    });
  }
);