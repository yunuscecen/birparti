import crypto from "crypto";

import PasswordResetToken from "../models/PasswordResetToken.js";
import RefreshToken from "../models/RefreshToken.js";
import User from "../models/User.js";

import {
  sendPasswordResetEmail,
} from "../services/emailService.js";

import {
  getClearRefreshCookieOptions,
  refreshCookieName,
} from "../utils/authTokens.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const getResetExpiry = () => {
  const minutes =
    Number(
      process.env
        .PASSWORD_RESET_MINUTES ||
        30
    );

  const safeMinutes =
    Number.isFinite(minutes) &&
    minutes > 0
      ? minutes
      : 30;

  return new Date(
    Date.now() +
      safeMinutes * 60 * 1000
  );
};

const getPublicWebUrl = () => {
  const configuredUrl =
    process.env.PUBLIC_WEB_URL ||
    process.env.CLIENT_URLS
      ?.split(",")
      ?.[0] ||
    "http://localhost:5173";

  return configuredUrl
    .trim()
    .replace(/\/+$/, "");
};

export const forgotPassword =
  asyncHandler(
    async (req, res) => {
      const { email } =
        req.validatedBody;

      const user =
        await User.findOne({
          email,
          status: "active",
        }).select(
          "_id firstName email"
        );

      if (user) {
        await PasswordResetToken.deleteMany({
          user: user._id,
        });

        const rawToken =
          crypto
            .randomBytes(32)
            .toString("hex");

        const tokenHash =
          hashToken(rawToken);

        const resetToken =
          await PasswordResetToken.create({
            user: user._id,
            tokenHash,
            expiresAt:
              getResetExpiry(),
          });

        const resetUrl =
          `${getPublicWebUrl()}/sifre-sifirla/${rawToken}`;

        try {
          await sendPasswordResetEmail({
            to: user.email,
            firstName:
              user.firstName,
            resetUrl,
          });
        } catch (error) {
          await PasswordResetToken.deleteOne({
            _id: resetToken._id,
          });

          console.error(
            "Password reset email error:",
            error
          );
        }
      }

      /*
       * E-posta adresinin sistemde
       * kayıtlı olup olmadığı
       * dışarı açıklanmaz.
       */
      res.status(200).json({
        success: true,

        message:
          "E-posta adresi sistemimizde kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
      });
    }
  );

export const resetPassword =
  asyncHandler(
    async (req, res) => {
      const rawToken =
        String(
          req.params.token || ""
        ).trim();

      const tokenHash =
        hashToken(rawToken);

      /*
       * findOneAndUpdate aynı tokenın
       * iki kez kullanılmasını önler.
       */
      const resetToken =
        await PasswordResetToken
          .findOneAndUpdate(
            {
              tokenHash,
              consumedAt: null,

              expiresAt: {
                $gt: new Date(),
              },
            },
            {
              $set: {
                consumedAt:
                  new Date(),
              },
            },
            {
              new: true,
            }
          )
          .populate("user");

      const user =
        resetToken?.user;

      if (
        !user ||
        user.status !== "active"
      ) {
        throw new AppError(
          "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
          400
        );
      }

      user.password =
        req.validatedBody
          .password;

      await user.save();

      /*
       * Şifre değişince kullanıcının
       * bütün yenilenebilir oturumları
       * kapatılır.
       */
      await RefreshToken.deleteMany({
        user: user._id,
      });

      res.clearCookie(
        refreshCookieName,
        getClearRefreshCookieOptions()
      );

      res.status(200).json({
        success: true,

        message:
          "Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.",
      });
    }
  );