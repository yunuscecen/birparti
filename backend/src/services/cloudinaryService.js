import {
  getCloudinaryClient,
} from "../config/cloudinary.js";

import AppError from "../utils/AppError.js";

const BIRPARTI_FOLDER_PREFIX =
  "birparti/";

const getConfiguredClient =
  () => {
    const cloudinary =
      getCloudinaryClient();

    if (!cloudinary) {
      throw new AppError(
        "Cloudinary yapılandırması eksik. Lütfen sunucu ortam değişkenlerini kontrol edin.",
        503
      );
    }

    return cloudinary;
  };

/**
 * Memory üzerinde bulunan görseli
 * Cloudinary'ye yükler.
 */
export const uploadImageBuffer =
  async ({
    buffer,
    folder,
    tags = [],
  }) => {
    if (
      !Buffer.isBuffer(buffer) ||
      buffer.length === 0
    ) {
      throw new AppError(
        "Yüklenecek görsel verisi bulunamadı.",
        400
      );
    }

    if (
      !folder ||
      !folder.startsWith(
        BIRPARTI_FOLDER_PREFIX
      )
    ) {
      throw new AppError(
        "Geçersiz Cloudinary klasörü.",
        400
      );
    }

    const cloudinary =
      getConfiguredClient();

    let result;

    try {
      result =
        await new Promise(
          (
            resolve,
            reject
          ) => {
            const uploadStream =
              cloudinary.uploader
                .upload_stream(
                  {
                    folder,

                    resource_type:
                      "image",

                    use_filename:
                      false,

                    unique_filename:
                      true,

                    overwrite:
                      false,

                    tags: [
                      "birparti",
                      ...tags,
                    ],
                  },

                  (
                    error,
                    uploadedAsset
                  ) => {
                    if (error) {
                      reject(error);
                      return;
                    }

                    resolve(
                      uploadedAsset
                    );
                  }
                );

            uploadStream.end(
              buffer
            );
          }
        );
    } catch (error) {
      console.error(
        "Cloudinary upload error:",
        error
      );

      throw new AppError(
        "Görsel Cloudinary üzerine yüklenemedi.",
        502
      );
    }

    if (
      !result?.secure_url ||
      !result?.public_id
    ) {
      throw new AppError(
        "Cloudinary geçerli bir görsel sonucu döndürmedi.",
        502
      );
    }

    return {
      url:
        result.secure_url,

      publicId:
        result.public_id,

      assetId:
        result.asset_id || "",

      width:
        Number(
          result.width || 0
        ),

      height:
        Number(
          result.height || 0
        ),

      format:
        result.format || "",

      bytes:
        Number(
          result.bytes || 0
        ),

      resourceType:
        result.resource_type ||
        "image",
    };
  };

/**
 * Cloudinary görselini publicId
 * üzerinden siler.
 *
 * Şimdilik route üzerinden çağırmayacağız.
 * Proje görseli değiştirilirken controller
 * tarafından güvenli biçimde kullanılacak.
 */
export const deleteCloudinaryImage =
  async (publicId) => {
    const normalizedPublicId =
      String(
        publicId || ""
      ).trim();

    if (!normalizedPublicId) {
      return {
        result:
          "not_provided",
      };
    }

    /*
     * Bir Parti dışındaki Cloudinary
     * klasörlerinden dosya silinmesini
     * engeller.
     */
    if (
      !normalizedPublicId.startsWith(
        BIRPARTI_FOLDER_PREFIX
      )
    ) {
      throw new AppError(
        "Bu görsel Bir Parti medya alanına ait değil.",
        400
      );
    }

    const cloudinary =
      getConfiguredClient();

    try {
      return await cloudinary
        .uploader
        .destroy(
          normalizedPublicId,
          {
            resource_type:
              "image",

            invalidate:
              true,
          }
        );
    } catch (error) {
      console.error(
        "Cloudinary delete error:",
        error
      );

      throw new AppError(
        "Cloudinary görseli silinemedi.",
        502
      );
    }
  };