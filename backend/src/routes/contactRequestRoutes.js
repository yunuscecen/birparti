import express from "express";
import rateLimit from "express-rate-limit";

import {
  createAccountContactRequest,
  createContactRequest,
  getAdminContactRequestById,
  getAdminContactRequests,
  getMyContactRequests,
  updateAdminContactRequest,
} from "../controllers/contactRequestController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  adminContactRequestUpdateSchema,
  publicContactRequestSchema,
} from "../validators/contactRequestValidators.js";

const router =
  express.Router();

const contactRequestLimiter =
  rateLimit({
    windowMs:
      60 * 60 * 1000,

    limit: 5,

    standardHeaders:
      "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      message:
        "Çok fazla iletişim talebi gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    },
  });

router.post(
  "/contact-requests",
  contactRequestLimiter,
  validateRequest(
    publicContactRequestSchema
  ),
  createContactRequest
);
router.post(
  "/account/contact-requests",
  requireAuth,
  contactRequestLimiter,
  validateRequest(
    publicContactRequestSchema
  ),
  createAccountContactRequest
);

router.get(
  "/account/contact-requests",
  requireAuth,
  getMyContactRequests
);
router.use(
  "/admin/contact-requests",
  requireAuth,
  requireRole(
    "admin",
    "superAdmin"
  )
);

router.get(
  "/admin/contact-requests",
  getAdminContactRequests
);

router.get(
  "/admin/contact-requests/:requestId",
  getAdminContactRequestById
);

router.patch(
  "/admin/contact-requests/:requestId",
  validateRequest(
    adminContactRequestUpdateSchema
  ),
  updateAdminContactRequest
);

export default router;