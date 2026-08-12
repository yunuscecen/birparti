import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  findEmailVerificationToken,
  sendUserEmailVerification,
} from "../services/emailVerificationService.js";

export const verifyEmail =
  asyncHandler(
    async (req, res) => {
      const rawToken = String(
        req.params.token || ""
      ).trim();

      const verificationToken =
        await findEmailVerificationToken(
          rawToken
        );

      if (
        !verificationToken ||
        !verificationToken.user
      ) {
        throw new AppError(
          "Doğrulama bağlantısı geçersiz veya süresi dolmuş.",
          400
        );
      }

      const user =
        verificationToken.user;

      if (!user.isEmailVerified) {
        user.isEmailVerified =
          true;

        user.emailVerifiedAt =
          new Date();

        await user.save({
          validateBeforeSave:
            false,
        });
      }

      if (
        !verificationToken
          .consumedAt
      ) {
        verificationToken.consumedAt =
          new Date();

        await verificationToken.save();
      }

      res.status(200).json({
        success: true,

        message:
          "E-posta adresiniz başarıyla doğrulandı.",
      });
    }
  );

export const resendEmailVerification =
  asyncHandler(
    async (req, res) => {
      if (
        req.user.isEmailVerified
      ) {
        return res
          .status(200)
          .json({
            success: true,

            message:
              "E-posta adresiniz zaten doğrulanmış.",
          });
      }

      try {
        await sendUserEmailVerification(
          req.user
        );
      } catch (error) {
        console.error(
          "Email verification resend error:",
          error
        );

        throw new AppError(
          "Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.",
          503
        );
      }

      res.status(200).json({
        success: true,

        message:
          "Yeni doğrulama bağlantısı e-posta adresinize gönderildi.",
      });
    }
  );