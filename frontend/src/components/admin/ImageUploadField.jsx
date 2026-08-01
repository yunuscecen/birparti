import {
  Eye,
  Image,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  uploadAdminImage,
} from "../../services/mediaService";

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const allowedImageTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

const getUploadErrorMessage =
  (error) => {
    return (
      error?.response?.data
        ?.message ||
      error?.message ||
      "Görsel yüklenemedi."
    );
  };

const ImageUploadField = ({
  id = "admin-image",
  label = "Görsel",
  value = "",
  altValue = "",
  folderKey =
    "project-cover",
  disabled = false,
  onChange,
  onAltChange,
  onUploadingChange,
}) => {
  const [
    isUploading,
    setIsUploading,
  ] = useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);

  const [
    uploadError,
    setUploadError,
  ] = useState("");

  const [
    previewFailed,
    setPreviewFailed,
  ] = useState(false);

  useEffect(() => {
    setPreviewFailed(false);
  }, [value]);

  useEffect(() => {
    return () => {
      onUploadingChange?.(
        false
      );
    };
  }, [onUploadingChange]);

  const updateUploadingState =
    (nextValue) => {
      setIsUploading(
        nextValue
      );

      onUploadingChange?.(
        nextValue
      );
    };

  const handleFileChange =
    async (event) => {
      const file =
        event.target
          .files?.[0];

      /*
       * Aynı dosyanın yeniden
       * seçilebilmesini sağlar.
       */
      event.target.value = "";

      if (!file) {
        return;
      }

      setUploadError("");

      if (
        !allowedImageTypes.has(
          file.type
        )
      ) {
        setUploadError(
          "Yalnızca JPG, PNG, WEBP veya AVIF görseller yüklenebilir."
        );

        return;
      }

      if (
        file.size >
        MAX_IMAGE_SIZE
      ) {
        setUploadError(
          "Görsel boyutu en fazla 8 MB olabilir."
        );

        return;
      }

      updateUploadingState(
        true
      );

      setUploadProgress(0);

      try {
        const image =
          await uploadAdminImage({
            file,
            folderKey,

            onUploadProgress:
              (progressEvent) => {
                if (
                  !progressEvent.total
                ) {
                  return;
                }

                const percentage =
                  Math.round(
                    (
                      progressEvent.loaded *
                      100
                    ) /
                      progressEvent.total
                  );

                setUploadProgress(
                  percentage
                );
              },
          });

       onChange?.(
  image.url,
  image.publicId || ""
);
      } catch (error) {
        setUploadError(
          getUploadErrorMessage(
            error
          )
        );
      } finally {
        updateUploadingState(
          false
        );
      }
    };

  return (
    <div className="admin-form">
      <div className="admin-form-field">
        <label
          htmlFor={`${id}-file`}
        >
          {label} yükle
        </label>

        <input
          id={`${id}-file`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={
            handleFileChange
          }
          disabled={
            disabled ||
            isUploading
          }
          hidden
        />

        <label
          htmlFor={`${id}-file`}
          className="admin-secondary-button"
          aria-disabled={
            disabled ||
            isUploading
          }
        >
          <Upload size={17} />

          {isUploading
            ? `Yükleniyor... ${uploadProgress}%`
            : "Bilgisayardan Görsel Seç"}
        </label>

        <small>
          JPG, PNG, WEBP veya
          AVIF. En fazla 8 MB.
        </small>
      </div>

      {uploadError && (
        <div
          className="admin-form-message admin-form-message--error"
          role="alert"
        >
          {uploadError}
        </div>
      )}

      <div className="admin-form-field">
        <label
          htmlFor={`${id}-url`}
        >
          Görsel adresi
        </label>

        <div className="admin-form-input-with-icon">
          <Image size={18} />

          <input
            id={`${id}-url`}
            type="url"
            value={value}
            onChange={(
              event
            ) => {
              setUploadError(
                ""
              );

           onChange?.(
  event.target.value,
  ""
);
            }}
            placeholder="https://..."
            disabled={
              disabled ||
              isUploading
            }
          />
        </div>

        <small>
          Yükleme tamamlandığında
          Cloudinary adresi buraya
          otomatik yazılır.
        </small>
      </div>

      <div className="admin-form-field">
        <label
          htmlFor={`${id}-alt`}
        >
          Görsel açıklaması
        </label>

        <input
          id={`${id}-alt`}
          value={altValue}
          onChange={(
            event
          ) =>
            onAltChange?.(
              event.target
                .value
            )
          }
          placeholder="Görsel erişilebilirlik açıklaması"
          maxLength={180}
          disabled={disabled}
        />
      </div>

      {value && (
        <>
          <div className="admin-image-preview">
            {!previewFailed ? (
              <img
                src={value}
                alt={
                  altValue ||
                  "Görsel önizlemesi"
                }
                onLoad={() =>
                  setPreviewFailed(
                    false
                  )
                }
                onError={() =>
                  setPreviewFailed(
                    true
                  )
                }
              />
            ) : (
              <p>
                Görsel önizlemesi
                yüklenemedi.
              </p>
            )}

            <div>
              <Eye size={18} />
              Görsel önizlemesi
            </div>
          </div>

          <button
            type="button"
            className="admin-secondary-button"
            disabled={
              disabled ||
              isUploading
            }
            onClick={() => {
              setUploadError(
                ""
              );

              setPreviewFailed(
                false
              );

          onChange?.("", "");
            }}
          >
            <Trash2 size={17} />
            Görseli Kaldır
          </button>
        </>
      )}
    </div>
  );
};

export default ImageUploadField;