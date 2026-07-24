import express from "express";

import {
  getPublicForumCategories,
  getPublicForumTopicBySlug,
  getPublicForumTopics,
} from "../controllers/forumController.js";

import {
  createForumReply,
  createForumTopic,
} from "../controllers/forumInteractionController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requireForumTopicPermission,
} from "../middleware/forumPermissionMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  createForumReplySchema,
  createForumTopicSchema,
} from "../validators/forumValidators.js";

const router = express.Router();

/*
 * Public forum alanları
 */
router.get(
  "/forum-categories",
  getPublicForumCategories
);

router.get(
  "/forum-topics",
  getPublicForumTopics
);

/*
 * Üye işlemleri
 *
 * Dinamik :slug rotasından önce yazılması
 * backend açısından daha anlaşılır bir yapı sağlar.
 */
router.post(
  "/forum-topics",
  requireAuth,
  requireForumTopicPermission,
  validateRequest(
    createForumTopicSchema
  ),
  createForumTopic
);

router.post(
  "/forum-topics/:slug/replies",
  requireAuth,
  validateRequest(
    createForumReplySchema
  ),
  createForumReply
);

router.get(
  "/forum-topics/:slug",
  getPublicForumTopicBySlug
);

export default router;