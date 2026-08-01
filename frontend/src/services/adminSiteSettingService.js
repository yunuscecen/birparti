import api from "./api";

export const getAdminSiteSettings =
  async () => {
    const response =
      await api.get(
        "/admin/site-settings"
      );

    return response.data.data;
  };

export const updateAdminSiteSettings =
  async (formData) => {
    const response =
      await api.put(
        "/admin/site-settings",
        formData
      );

    return response.data.data;
  };