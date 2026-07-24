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

const router =
  express.Router();

router.use(
  "/account/forum",
  requireAuth
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
export default router;