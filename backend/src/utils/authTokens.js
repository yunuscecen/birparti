import crypto from "crypto";
import jwt from "jsonwebtoken";

export const refreshCookieName =
  process.env.REFRESH_COOKIE_NAME || "birparti_refresh";

const getRefreshTokenDays = () => {
  const value = Number(process.env.REFRESH_TOKEN_DAYS || 7);

  return Number.isFinite(value) && value > 0 ? value : 7;
};

export const createAccessToken = (user) => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET tanımlanmamış.");
  }

  return jwt.sign(
    {
      role: user.role,
      permissions: user.permissions || [],
    },
    secret,
    {
      subject: user._id.toString(),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      issuer: "birparti-api",
      audience: "birparti-web",
    }
  );
};

export const createRawRefreshToken = () => {
  return crypto.randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const getRefreshTokenExpiry = () => {
  const days = getRefreshTokenDays();

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const getBaseCookieOptions = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
  };
};

export const getRefreshCookieOptions = () => {
  const days = getRefreshTokenDays();

  return {
    ...getBaseCookieOptions(),
    maxAge: days * 24 * 60 * 60 * 1000,
  };
};

export const getClearRefreshCookieOptions = () => {
  return getBaseCookieOptions();
};