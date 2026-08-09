import express from "express";

import {
  getPublicTransparency,
} from "../controllers/transparencyController.js";

import {
  createAdminTransparencyRecord,
  getAdminTransparencyRecords,
  updateAdminTransparencyRecord,
} from "../controllers/adminTransparencyController.js";

import {
  requireAuth,
  requireRole,
} from "../middleware/authMiddleware.js";

import validateRequest from "../middleware/validateRequest.js";

import {
  transparencyRecordSchema,
} from "../validators/transparencyValidators.js";

const router = express.Router();

router.get(
  "/transparency",
  getPublicTransparency
);

router.use(
  "/admin/transparency",
  requireAuth,
  requireRole(
    "financeManager",
    "admin",
    "superAdmin"
  )
);

router.get(
  "/admin/transparency",
  getAdminTransparencyRecords
);

router.post(
  "/admin/transparency",
  validateRequest(
    transparencyRecordSchema
  ),
  createAdminTransparencyRecord
);

router.patch(
  "/admin/transparency/:recordId",
  validateRequest(
    transparencyRecordSchema
  ),
  updateAdminTransparencyRecord
);

export default router;