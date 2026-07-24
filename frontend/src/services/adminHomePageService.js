import api from "./api";

export const getAdminHomePage =
  async () => {
    const response = await api.get(
      "/admin/homepage"
    );

    return response.data.data;
  };

export const updateAdminHomePage =
  async (formData) => {
    const response = await api.put(
      "/admin/homepage",
      formData
    );

    return response.data.data;
  };