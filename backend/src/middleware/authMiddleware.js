import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const extractBearerToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return "";
  }

  return authorizationHeader.slice(7).trim();
};

export const requireAuth = asyncHandler(
  async (req, res, next) => {
    const token = extractBearerToken(
      req.headers.authorization
    );

    if (!token) {
      throw new AppError(
        "Bu işlemi gerçekleştirmek için giriş yapmalısınız.",
        401
      );
    }

    let payload;

    try {
      payload = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET,
        {
          issuer: "birparti-api",
          audience: "birparti-web",
        }
      );
    } catch {
      throw new AppError(
        "Oturum süresi dolmuş veya oturum geçersiz.",
        401
      );
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError(
        "Bu oturuma bağlı kullanıcı bulunamadı.",
        401
      );
    }

    if (user.status !== "active") {
      throw new AppError(
        "Kullanıcı hesabı aktif değil.",
        403
      );
    }

    if (user.changedPasswordAfter(payload.iat)) {
      throw new AppError(
        "Şifreniz değiştirildiği için yeniden giriş yapmalısınız.",
        401
      );
    }

    req.user = user;
    req.auth = payload;

    next();
  }
);

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Kullanıcı oturumu bulunamadı.", 401)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          "Bu işlem için gerekli role sahip değilsiniz.",
          403
        )
      );
    }

    next();
  };
};

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Kullanıcı oturumu bulunamadı.", 401)
      );
    }

    if (req.user.role === "superAdmin") {
      return next();
    }

    const userPermissions = req.user.permissions || [];

    const hasEveryPermission = requiredPermissions.every(
      (permission) => userPermissions.includes(permission)
    );

    if (!hasEveryPermission) {
      return next(
        new AppError(
          "Bu işlem için gerekli yetkiye sahip değilsiniz.",
          403
        )
      );
    }

    next();
  };
};