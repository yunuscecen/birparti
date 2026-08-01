import api from "./api";

export const getPublicSiteSettings =
  async () => {
    const response =
      await api.get(
        "/site-settings"
      );

    return response.data.data;
  };