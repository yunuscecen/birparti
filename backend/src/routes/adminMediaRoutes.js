import express from "express";

import {
  uploadAdminImage,
} from "../controllers/adminMediaController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import {
  uploadSingleImage,
} from "../middleware/imageUploadMiddleware.js";

const router =
  express.Router();

router.use(
  "/admin/media",
  requireAuth,
  requireRole(
    "admin",
    "superAdmin"
  )
);

router.post(
  "/admin/media/images",
  uploadSingleImage,
  uploadAdminImage
);

export default router;