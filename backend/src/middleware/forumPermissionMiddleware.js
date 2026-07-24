import AppError from "../utils/AppError.js";

const privilegedRoles = new Set([
  "moderator",
  "admin",
  "superAdmin",
]);

const normalizePermissions = (permissions) => {
  if (!permissions) {
    return [];
  }

  if (Array.isArray(permissions)) {
    return permissions;
  }

  if (permissions instanceof Map) {
    return Array.from(permissions.keys()).filter(
      (permission) =>
        Boolean(permissions.get(permission))
    );
  }

  if (typeof permissions === "object") {
    return Object.entries(permissions)
      .filter(([, enabled]) => Boolean(enabled))
      .map(([permission]) => permission);
  }

  return [];
};

export const requireForumTopicPermission = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return next(
      new AppError(
        "Bu işlem için giriş yapmalısınız.",
        401
      )
    );
  }

  if (privilegedRoles.has(req.user.role)) {
    return next();
  }

  const permissions = normalizePermissions(
    req.user.permissions
  );

  if (
    !permissions.includes(
      "forum:create-topic"
    )
  ) {
    return next(
      new AppError(
        "Yeni forum konusu açma yetkiniz bulunmuyor.",
        403
      )
    );
  }

  return next();
};