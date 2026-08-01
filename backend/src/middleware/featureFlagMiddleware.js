import SiteSetting from "../models/SiteSetting.js";
import asyncHandler from "../utils/asyncHandler.js";

export const requireFeatureEnabled = (
  feature,
  message
) => {
  return asyncHandler(
    async (req, res, next) => {
      const settings =
        await SiteSetting.findOne({
          key: "global",
        })
          .select(
            `features.${feature}`
          )
          .lean();

      /*
       * Henüz ayar kaydı yoksa
       * varsayılan olarak özellik
       * açık kabul edilir.
       */
      const isEnabled =
        settings?.features?.[
          feature
        ] !== false;

      if (isEnabled) {
        next();
        return;
      }

      res.status(503).json({
        success: false,
        featureDisabled: true,
        feature,

        message:
          message ||
          "Bu özellik şu anda kullanıma kapalıdır.",
      });
    }
  );
};