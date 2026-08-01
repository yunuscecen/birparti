import express from "express";
import rateLimit from "express-rate-limit";
import {
  getCurrentUser,
  login,
  logout,
  refreshSession,
  register,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  requireFeatureEnabled,
} from "../middleware/featureFlagMiddleware.js";

import {
  forgotPassword,
  resetPassword,
} from "../controllers/passwordResetController.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/authValidators.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Çok fazla giriş veya kayıt isteği gönderildi. Lütfen biraz sonra tekrar deneyin.",
  },
});
const passwordResetLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 5,

    standardHeaders:
      "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      message:
        "Çok fazla şifre sıfırlama isteği gönderdiniz. Lütfen daha sonra tekrar deneyin.",
    },
  });
router.post(
  "/auth/register",
  authLimiter,

  requireFeatureEnabled(
    "registrationsEnabled",
    "Yeni üyelik oluşturma işlemleri şu anda kapalıdır."
  ),

  validateRequest(
    registerSchema
  ),

  register
);

router.post(
  "/auth/login",
  authLimiter,
  validateRequest(loginSchema),
  login
);

router.post(
  "/auth/refresh",
  authLimiter,
  refreshSession
);

router.post("/auth/logout", logout);

router.get(
  "/auth/me",
  requireAuth,
  getCurrentUser
);

router.post(
  "/auth/forgot-password",
  passwordResetLimiter,
  validateRequest(
    forgotPasswordSchema
  ),
  forgotPassword
);

router.post(
  "/auth/reset-password/:token",
  passwordResetLimiter,
  validateRequest(
    resetPasswordSchema
  ),
  resetPassword
);

export default router;