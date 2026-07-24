import express from "express";

import {
  getMyForumOverview,
  getMyForumReplies,
  getMyForumTopics,
} from "../controllers/accountForumController.js";

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

export default router;