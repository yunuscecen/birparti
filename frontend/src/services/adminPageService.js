import api from "./api";

export const getAdminPages = async () => {
  const response = await api.get(
    "/admin/pages"
  );

  return response.data.data;
};

export const getAdminPageBySlug = async (
  slug
) => {
  const response = await api.get(
    `/admin/pages/${slug}`
  );

  return response.data.data;
};

export const updateAdminPage = async ({
  slug,
  formData,
}) => {
  const response = await api.patch(
    `/admin/pages/${slug}`,
    formData
  );

  return response.data.data;
};