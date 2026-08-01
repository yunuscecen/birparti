import SiteSetting from "../models/SiteSetting.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedPaths =
  new Set([
    "/health",
    "/site-settings",
    "/auth/login",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/logout",
    "/auth/me",
  ]);

const maintenanceModeMiddleware =
  asyncHandler(
    async (req, res, next) => {
     if (
  req.method === "OPTIONS" ||
  allowedPaths.has(req.path) ||
  req.path.startsWith(
    "/auth/reset-password/"
  ) ||
  req.path.startsWith(
    "/admin/"
  )
) {
  next();
  return;
}

      const settings =
        await SiteSetting.findOne({
          key: "global",
        })
          .select(
            "features.maintenanceMode maintenanceMessage"
          )
          .lean();

      if (
        !settings?.features
          ?.maintenanceMode
      ) {
        next();
        return;
      }

      res.status(503).json({
        success: false,
        maintenance: true,

        message:
          settings
            .maintenanceMessage ||
          "Sitemiz kısa süreli bir bakım çalışmasındadır.",
      });
    }
  );

export default maintenanceModeMiddleware;