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
  loginSchema,
  registerSchema,
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

router.post(
  "/auth/register",
  authLimiter,
  validateRequest(registerSchema),
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

export default router;