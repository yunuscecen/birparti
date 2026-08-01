import express from "express";

import {
  getAdminSiteSettings,
  getPublicSiteSettings,
  updateAdminSiteSettings,
} from "../controllers/siteSettingController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  updateSiteSettingSchema,
} from "../validators/siteSettingValidators.js";

const router =
  express.Router();

/*
 * Header, Footer ve diğer herkese
 * açık alanların kullanacağı endpoint.
 */
router.get(
  "/site-settings",
  getPublicSiteSettings
);

/*
 * Bu adresin altındaki tüm işlemler
 * yalnızca admin ve superAdmin
 * rollerine açıktır.
 */
router.use(
  "/admin/site-settings",
  requireAuth,
  requireRole(
    "admin",
    "superAdmin"
  )
);

router.get(
  "/admin/site-settings",
  getAdminSiteSettings
);

router.put(
  "/admin/site-settings",
  validateRequest(
    updateSiteSettingSchema
  ),
  updateAdminSiteSettings
);

export default router;