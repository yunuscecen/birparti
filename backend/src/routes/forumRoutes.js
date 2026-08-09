import express from "express";

import {
  getPublicForumCategories,
  getPublicForumTopicBySlug,
  getPublicForumTopics,
} from "../controllers/forumController.js";

import {
  createForumReply,
  createForumTopic,
  getMyForumTopicInteraction,
  updateForumTopicSolvedStatus,
  updateForumTopicSupport,
  updateForumTopicVote,
} from "../controllers/forumInteractionController.js";

import {
  createForumReport,
} from "../controllers/forumReportController.js";

import {
  requireFeatureEnabled,
} from "../middleware/featureFlagMiddleware.js";
import {
  requireAuth,
} from "../middleware/authMiddleware.js";



import validateRequest from "../middleware/validateRequest.js";

import {
  createForumReplySchema,
  createForumReportSchema,
  createForumTopicSchema,
  updateForumTopicSolvedSchema,
  updateForumTopicSupportSchema,
  updateForumTopicVoteSchema,
} from "../validators/forumValidators.js";

const router = express.Router();
router.use(
  requireFeatureEnabled(
    "forumEnabled",
    "Forum şu anda kullanıma kapalıdır."
  )
);
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
  validateRequest(
    createForumTopicSchema
  ),
  createForumTopic
);

router.get(
  "/forum-topics/:slug/interaction",
  requireAuth,
  getMyForumTopicInteraction
);

router.patch(
  "/forum-topics/:slug/vote",
  requireAuth,
  validateRequest(
    updateForumTopicVoteSchema
  ),
  updateForumTopicVote
);

router.patch(
  "/forum-topics/:slug/support",
  requireAuth,
  validateRequest(
    updateForumTopicSupportSchema
  ),
  updateForumTopicSupport
);

router.patch(
  "/forum-topics/:slug/solved",
  requireAuth,
  validateRequest(
    updateForumTopicSolvedSchema
  ),
  updateForumTopicSolvedStatus
);

router.post(
  "/forum-topics/:slug/replies",
  requireAuth,
  validateRequest(
    createForumReplySchema
  ),
  createForumReply
);
router.post(
  "/forum-reports",
  requireAuth,
  validateRequest(
    createForumReportSchema
  ),
  createForumReport
);
router.get(
  "/forum-topics/:slug",
  getPublicForumTopicBySlug
);

export default router;