import api from "./api";

export const uploadAdminImage =
  async ({
    file,
    folderKey =
      "project-cover",
    onUploadProgress,
  }) => {
    if (!file) {
      throw new Error(
        "Yüklenecek görsel seçilmelidir."
      );
    }

    const uploadData =
      new FormData();

    uploadData.append(
      "image",
      file
    );

    uploadData.append(
      "folderKey",
      folderKey
    );

    const response =
      await api.post(
        "/admin/media/images",
        uploadData,
        {
          onUploadProgress,
        }
      );

    return response.data.data.image;
  };