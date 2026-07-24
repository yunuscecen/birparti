import api from "./api";

export const getHomePageContent =
  async () => {
    const response = await api.get(
      "/homepage"
    );

    return response.data.data;
  };