import express from "express";
import {
  getAdminDashboard,
  getAdminUsers,
  updateForumPermission,
  updateUserRole,
  updateUserStatus,
} from "../controllers/adminUserController.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  updateForumPermissionSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validators/adminUserValidators.js";

const router = express.Router();

router.use(
  "/admin",
  requireAuth,
  requireRole("admin", "superAdmin")
);

router.get(
  "/admin/dashboard",
  getAdminDashboard
);

router.get(
  "/admin/users",
  getAdminUsers
);

router.patch(
  "/admin/users/:userId/status",
  validateRequest(updateUserStatusSchema),
  updateUserStatus
);

router.patch(
  "/admin/users/:userId/forum-permission",
  validateRequest(updateForumPermissionSchema),
  updateForumPermission
);

router.patch(
  "/admin/users/:userId/role",
  requireRole("superAdmin"),
  validateRequest(updateUserRoleSchema),
  updateUserRole
);

export default router;