import multer from "multer";

import AppError from "../utils/AppError.js";

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const allowedMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

const imageUpload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        MAX_IMAGE_SIZE,

      files:
        1,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      if (
        !allowedMimeTypes.has(
          file.mimetype
        )
      ) {
        callback(
          new AppError(
            "Yalnızca JPG, PNG, WEBP veya AVIF görseller yüklenebilir.",
            415
          )
        );

        return;
      }

      callback(null, true);
    },
  }).single("image");

export const uploadSingleImage =
  (req, res, next) => {
    imageUpload(
      req,
      res,
      (error) => {
        if (!error) {
          next();
          return;
        }

        if (
          error instanceof
            multer.MulterError &&
          error.code ===
            "LIMIT_FILE_SIZE"
        ) {
          next(
            new AppError(
              "Görsel boyutu en fazla 8 MB olabilir.",
              413
            )
          );

          return;
        }

        if (
          error instanceof
          AppError
        ) {
          next(error);
          return;
        }

        console.error(
          "Multer upload error:",
          error
        );

        next(
          new AppError(
            "Görsel yükleme isteği işlenemedi.",
            400
          )
        );
      }
    );
  };

export default uploadSingleImage;