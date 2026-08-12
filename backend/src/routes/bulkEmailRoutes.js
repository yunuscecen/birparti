import express from "express";
import rateLimit from "express-rate-limit";

import {
  createAdminBulkEmailCampaign,
  getAdminBulkEmailCampaignById,
  getAdminBulkEmailCampaigns,
  getBulkEmailAudienceCount,
  sendAdminBulkEmailCampaign,
  sendAdminBulkEmailTest,
  unsubscribeMarketingEmails,
  updateAdminBulkEmailCampaign,
} from "../controllers/adminBulkEmailController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  bulkEmailCampaignSchema,
  sendBulkEmailSchema,
} from "../validators/bulkEmailValidators.js";

const router = express.Router();

const unsubscribeLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,
    limit: 20,
    standardHeaders:
      "draft-8",
    legacyHeaders: false,
  });

router.post(
  "/email-preferences/unsubscribe/:token",
  unsubscribeLimiter,
  unsubscribeMarketingEmails
);

router.use(
  "/admin/bulk-emails",
  requireAuth,
  requireRole(
    "admin",
    "superAdmin"
  )
);

router.get(
  "/admin/bulk-emails/audience-count",
  getBulkEmailAudienceCount
);

router.get(
  "/admin/bulk-emails",
  getAdminBulkEmailCampaigns
);

router.post(
  "/admin/bulk-emails",
  validateRequest(
    bulkEmailCampaignSchema
  ),
  createAdminBulkEmailCampaign
);

router.get(
  "/admin/bulk-emails/:campaignId",
  getAdminBulkEmailCampaignById
);

router.patch(
  "/admin/bulk-emails/:campaignId",
  validateRequest(
    bulkEmailCampaignSchema
  ),
  updateAdminBulkEmailCampaign
);

router.post(
  "/admin/bulk-emails/:campaignId/test",
  sendAdminBulkEmailTest
);

router.post(
  "/admin/bulk-emails/:campaignId/send",
  validateRequest(
    sendBulkEmailSchema
  ),
  sendAdminBulkEmailCampaign
);

export default router;