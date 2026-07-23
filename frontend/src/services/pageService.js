import api from "./api";

export const getPageBySlug = async (slug) => {
  const response = await api.get(`/pages/${slug}`);

  return response.data;
};