import express from "express";

import {
  getAdminPageBySlug,
  getAdminPages,
  updateAdminPageBySlug,
} from "../controllers/adminPageController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import { updateAdminPageSchema } from "../validators/adminPageValidators.js";

const router = express.Router();

router.use(
  "/admin/pages",
  requireAuth,
  requireRole("admin", "superAdmin")
);

router.get(
  "/admin/pages",
  getAdminPages
);

router.get(
  "/admin/pages/:slug",
  getAdminPageBySlug
);

router.patch(
  "/admin/pages/:slug",
  validateRequest(updateAdminPageSchema),
  updateAdminPageBySlug
);

export default router;