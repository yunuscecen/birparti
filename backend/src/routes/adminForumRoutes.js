import express from "express";

import {
  createAdminForumCategory,
  deleteAdminForumCategory,
  getAdminForumCategories,
  getAdminForumOverview,
  getAdminForumTopicById,
  getAdminForumTopicReplies,
  getAdminForumTopics,
  updateAdminForumCategory,
  updateAdminForumReplyModeration,
  updateAdminForumTopicModeration,
} from "../controllers/adminForumController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  adminForumCategorySchema,
  adminForumReplyModerationSchema,
  adminForumTopicModerationSchema,
} from "../validators/adminForumValidators.js";

const router = express.Router();

router.use(
  "/admin/forum",
  requireAuth,
  requireRole("admin", "superAdmin")
);

router.get(
  "/admin/forum/overview",
  getAdminForumOverview
);

router.get(
  "/admin/forum/categories",
  getAdminForumCategories
);

router.post(
  "/admin/forum/categories",
  validateRequest(adminForumCategorySchema),
  createAdminForumCategory
);

router.patch(
  "/admin/forum/categories/:categoryId",
  validateRequest(adminForumCategorySchema),
  updateAdminForumCategory
);

router.delete(
  "/admin/forum/categories/:categoryId",
  deleteAdminForumCategory
);

router.get(
  "/admin/forum/topics",
  getAdminForumTopics
);

router.get(
  "/admin/forum/topics/:topicId/replies",
  getAdminForumTopicReplies
);

router.get(
  "/admin/forum/topics/:topicId",
  getAdminForumTopicById
);

router.patch(
  "/admin/forum/replies/:replyId/moderation",
  validateRequest(
    adminForumReplyModerationSchema
  ),
  updateAdminForumReplyModeration
);

router.patch(
  "/admin/forum/topics/:topicId/moderation",
  validateRequest(adminForumTopicModerationSchema),
  updateAdminForumTopicModeration
);

export default router;