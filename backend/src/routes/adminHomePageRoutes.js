import express from "express";

import {
  getAdminHomePage,
  updateAdminHomePage,
} from "../controllers/adminHomePageController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import { updateAdminHomePageSchema } from "../validators/adminHomePageValidators.js";

const router = express.Router();

router.use(
  "/admin/homepage",
  requireAuth,
  requireRole("admin", "superAdmin")
);

router.get(
  "/admin/homepage",
  getAdminHomePage
);

router.put(
  "/admin/homepage",
  validateRequest(
    updateAdminHomePageSchema
  ),
  updateAdminHomePage
);

export default router;