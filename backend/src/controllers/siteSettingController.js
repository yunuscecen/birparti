import SiteSetting from "../models/SiteSetting.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteCloudinaryImage,
} from "../services/cloudinaryService.js";


const deleteUnusedBrandingImageSafely =
  async (publicId) => {
    const normalizedPublicId =
      String(
        publicId || ""
      ).trim();

    if (!normalizedPublicId) {
      return;
    }

    try {
      /*
       * Aynı görsel logo veya
       * favicon olarak hâlâ
       * kullanılıyorsa silinmez.
       */
      const imageStillInUse =
        await SiteSetting.exists({
          $or: [
            {
              "branding.logo.publicId":
                normalizedPublicId,
            },
            {
              "branding.favicon.publicId":
                normalizedPublicId,
            },
          ],
        });

      if (imageStillInUse) {
        return;
      }

      await deleteCloudinaryImage(
        normalizedPublicId
      );
    } catch (error) {
      /*
       * Ayarlar kaydedildiyse
       * Cloudinary temizleme hatası
       * isteği başarısız göstermemeli.
       */
      console.error(
        "Site branding image cleanup error:",
        {
          publicId:
            normalizedPublicId,

          message:
            error?.message ||
            "Bilinmeyen hata",
        }
      );
    }
  };

const getDefaultSettings = () => {
  const settings =
    new SiteSetting({
      key: "global",
    });

  return settings.toObject();
};

const serializePublicSettings = (
  settings
) => {
  return {
    branding: {
  logo: {
    url:
      settings.branding
        ?.logo?.url || "",



    alt:
      settings.branding
        ?.logo?.alt ||
      "Bir Parti logosu",
  },

  favicon: {
    url:
      settings.branding
        ?.favicon?.url || "",

   

    alt:
      settings.branding
        ?.favicon?.alt ||
      "Bir Parti faviconu",
  },
},
    identity: {
      siteName:
        settings.identity
          ?.siteName ||
        "BİR PARTİ",

      shortName:
        settings.identity
          ?.shortName ||
        "Bir Parti",

      description:
        settings.identity
          ?.description ||
        "",
    },

    contact: {
      email:
        settings.contact
          ?.email ||
        "bilgi@birparti.com",

      phone:
        settings.contact
          ?.phone ||
        "",

      address:
        settings.contact
          ?.address ||
        "",
    },

    footer: {
      primaryText:
        settings.footer
          ?.primaryText ||
        "",

      secondaryText:
        settings.footer
          ?.secondaryText ||
        "",

      copyrightText:
        settings.footer
          ?.copyrightText ||
        "",
    },

    socialLinks: {
      instagram:
        settings.socialLinks
          ?.instagram ||
        "",

      facebook:
        settings.socialLinks
          ?.facebook ||
        "",

      x:
        settings.socialLinks
          ?.x ||
        "",

      youtube:
        settings.socialLinks
          ?.youtube ||
        "",

      linkedin:
        settings.socialLinks
          ?.linkedin ||
        "",
    },

    features: {
      maintenanceMode:
        Boolean(
          settings.features
            ?.maintenanceMode
        ),

      registrationsEnabled:
        settings.features
          ?.registrationsEnabled !==
        false,

      forumEnabled:
        settings.features
          ?.forumEnabled !==
        false,
    },

    maintenanceMessage:
      settings.maintenanceMessage ||
      "",
  };
};

/**
 * GET /api/site-settings
 *
 * Herkese açık ve güvenli site
 * ayarlarını döndürür.
 */
export const getPublicSiteSettings =
  asyncHandler(
    async (req, res) => {
      const storedSettings =
        await SiteSetting.findOne({
          key: "global",
        }).lean();

      const settings =
        storedSettings ||
        getDefaultSettings();

      res.status(200).json({
        success: true,

        data: {
          settings:
            serializePublicSettings(
              settings
            ),
        },
      });
    }
  );

/**
 * GET /api/admin/site-settings
 *
 * Yönetim panelinde kullanılacak
 * tüm ayarları döndürür.
 */
export const getAdminSiteSettings =
  asyncHandler(
    async (req, res) => {
      const storedSettings =
        await SiteSetting.findOne({
          key: "global",
        })
          .populate({
            path: "updatedBy",

            select:
              "firstName lastName email",
          })
          .lean();

      const settings =
        storedSettings ||
        getDefaultSettings();

      res.status(200).json({
        success: true,

        data: {
          settings,
        },
      });
    }
  );

/**
 * PUT /api/admin/site-settings
 *
 * Site ayarlarını oluşturur veya
 * mevcut ayarları günceller.
 */
export const updateAdminSiteSettings =
  asyncHandler(
    async (req, res) => {
      const data =
        req.validatedBody;

      /*
       * Güncellemeden önce eski
       * Cloudinary kimliklerini
       * saklıyoruz.
       */
      const previousSettings =
        await SiteSetting.findOne({
          key: "global",
        })
          .select(
            "branding.logo.publicId branding.favicon.publicId"
          )
          .lean();

      const previousLogoPublicId =
        previousSettings
          ?.branding?.logo
          ?.publicId || "";

      const previousFaviconPublicId =
        previousSettings
          ?.branding?.favicon
          ?.publicId || "";

      const settings =
        await SiteSetting.findOneAndUpdate(
          {
            key: "global",
          },
          {
            $set: {
              branding:
                data.branding,

              identity:
                data.identity,

              contact:
                data.contact,

              footer:
                data.footer,

              socialLinks:
                data.socialLinks,

              features:
                data.features,

              maintenanceMessage:
                data.maintenanceMessage,

              updatedBy:
                req.user._id,
            },

            $setOnInsert: {
              key: "global",
            },
          },
          {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
          }
        ).populate({
          path: "updatedBy",

          select:
            "firstName lastName email",
        });

      const nextLogoPublicId =
        settings.branding
          ?.logo?.publicId ||
        "";

      const nextFaviconPublicId =
        settings.branding
          ?.favicon?.publicId ||
        "";

      const cleanupTasks = [];

      if (
        previousLogoPublicId &&
        previousLogoPublicId !==
          nextLogoPublicId
      ) {
        cleanupTasks.push(
          deleteUnusedBrandingImageSafely(
            previousLogoPublicId
          )
        );
      }

      if (
        previousFaviconPublicId &&
        previousFaviconPublicId !==
          nextFaviconPublicId
      ) {
        cleanupTasks.push(
          deleteUnusedBrandingImageSafely(
            previousFaviconPublicId
          )
        );
      }

      await Promise.all(
        cleanupTasks
      );

      res.status(200).json({
        success: true,

        message:
          "Site ayarları başarıyla güncellendi.",

        data: {
          settings,
        },
      });
    }
  );