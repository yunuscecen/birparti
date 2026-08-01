import {
  uploadImageBuffer,
} from "../services/cloudinaryService.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const allowedUploadFolders = {
  
  "project-cover":
    "birparti/projects/covers",

  "project-gallery":
    "birparti/projects/gallery",

  "blog-cover":
    "birparti/blog/covers",

  homepage:
    "birparti/homepage",

 page:
  "birparti/pages",

"site-logo":
  "birparti/site/logo",

"site-favicon":
  "birparti/site/favicon",
    
};

export const uploadAdminImage =
  asyncHandler(
    async (req, res) => {
      if (!req.file) {
        throw new AppError(
          "Yüklenecek görsel bulunamadı.",
          400
        );
      }

      const folderKey =
        String(
          req.body.folderKey ||
            "project-cover"
        ).trim();

      const folder =
        allowedUploadFolders[
          folderKey
        ];

      if (!folder) {
        throw new AppError(
          "Geçersiz görsel kullanım alanı.",
          400
        );
      }

      const image =
        await uploadImageBuffer({
          buffer:
            req.file.buffer,

          folder,

          tags: [
            folderKey,
            "admin-upload",
          ],
        });

      res.status(201).json({
        success: true,

        message:
          "Görsel başarıyla yüklendi.",

        data: {
          image,
        },
      });
    }
  );