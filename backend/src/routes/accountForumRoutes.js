import express from "express";

import {
  getMyForumOverview,
  getMyForumReplies,
  getMyForumTopics,
} from "../controllers/accountForumController.js";

import {
  getMyForumNotifications,
  markAllForumNotificationsRead,
  markForumNotificationRead,
} from "../controllers/accountForumNotificationController.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  deleteMyForumReply,
  deleteMyForumTopic,
  getMyForumReplyForEdit,
  getMyForumTopicForEdit,
  updateMyForumReply,
  updateMyForumTopic,
} from "../controllers/accountForumContentController.js";
import {
  updateMyForumReplySchema,
  updateMyForumTopicSchema,
} from "../validators/accountForumValidators.js";
import {
  getMyForumReports,
} from "../controllers/accountForumReportController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";
import {
  requireFeatureEnabled,
} from "../middleware/featureFlagMiddleware.js";
const router =
  express.Router();

router.use(
  "/account/forum",
  requireAuth,

  requireFeatureEnabled(
    "forumEnabled",
    "Forum şu anda kullanıma kapalıdır."
  )
);

router.get(
  "/account/forum/overview",
  getMyForumOverview
);

router.get(
  "/account/forum/topics",
  getMyForumTopics
);

router.get(
  "/account/forum/replies",
  getMyForumReplies
);
router.get(
  "/account/forum/notifications",
  getMyForumNotifications
);

router.patch(
  "/account/forum/notifications/read-all",
  markAllForumNotificationsRead
);

router.patch(
  "/account/forum/notifications/:notificationId/read",
  markForumNotificationRead
);

router.get(
  "/account/forum/reports",
  getMyForumReports
);


router.get(
  "/account/forum/topics/:topicId/edit",
  getMyForumTopicForEdit
);

router.patch(
  "/account/forum/topics/:topicId/edit",
  validateRequest(
    updateMyForumTopicSchema
  ),
  updateMyForumTopic
);

router.get(
  "/account/forum/replies/:replyId/edit",
  getMyForumReplyForEdit
);

router.patch(
  "/account/forum/replies/:replyId/edit",
  validateRequest(
    updateMyForumReplySchema
  ),
  updateMyForumReply
);


router.delete(
  "/account/forum/topics/:topicId",
  deleteMyForumTopic
);

router.delete(
  "/account/forum/replies/:replyId",
  deleteMyForumReply
);

export default router;