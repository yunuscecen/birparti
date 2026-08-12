import crypto from "crypto";

import EmailVerificationToken from "../models/EmailVerificationToken.js";

import {
  sendEmailVerificationEmail,
} from "./emailService.js";

const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
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

const getExpiryDate = () => {
  const minutes = Number(
    process.env
      .EMAIL_VERIFICATION_MINUTES ||
      1440
  );

  const safeMinutes =
    Number.isFinite(minutes) &&
    minutes > 0
      ? minutes
      : 1440;

  return new Date(
    Date.now() +
      safeMinutes * 60 * 1000
  );
};

export const sendUserEmailVerification =
  async (user) => {
    await EmailVerificationToken.deleteMany({
      user: user._id,
    });

    const rawToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationToken =
      await EmailVerificationToken.create({
        user: user._id,
        tokenHash:
          hashToken(rawToken),
        expiresAt:
          getExpiryDate(),
      });

    const verificationUrl =
      `${getPublicWebUrl()}` +
      `/e-posta-dogrula/${rawToken}`;

    try {
      await sendEmailVerificationEmail({
        to: user.email,
        firstName: user.firstName,
        verificationUrl,
      });
    } catch (error) {
      await EmailVerificationToken.deleteOne({
        _id: verificationToken._id,
      });

      throw error;
    }
  };

export const findEmailVerificationToken =
  async (rawToken) => {
    const tokenHash =
      hashToken(rawToken);

    return EmailVerificationToken
      .findOne({
        tokenHash,

        expiresAt: {
          $gt: new Date(),
        },
      })
      .populate("user");
  };