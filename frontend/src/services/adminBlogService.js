import api from "./api";

export const getAdminBlogCategories =
  async () => {
    const response = await api.get(
      "/admin/blog-categories"
    );

    return response.data.data;
  };

export const createAdminBlogCategory =
  async (formData) => {
    const response = await api.post(
      "/admin/blog-categories",
      formData
    );

    return response.data.data;
  };

export const updateAdminBlogCategory =
  async ({
    categoryId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/blog-categories/${categoryId}`,
      formData
    );

    return response.data.data;
  };

export const deleteAdminBlogCategory =
  async (categoryId) => {
    const response = await api.delete(
      `/admin/blog-categories/${categoryId}`
    );

    return response.data;
  };

export const getAdminBlogPosts =
  async ({
    page = 1,
    search = "",
    category = "",
    status = "",
  } = {}) => {
    const response = await api.get(
      "/admin/blog-posts",
      {
        params: {
          page,

          ...(search && {
            search,
          }),

          ...(category && {
            category,
          }),

          ...(status && {
            status,
          }),
        },
      }
    );

    return response.data.data;
  };

export const getAdminBlogPostById =
  async (postId) => {
    const response = await api.get(
      `/admin/blog-posts/${postId}`
    );

    return response.data.data;
  };

export const createAdminBlogPost =
  async (formData) => {
    const response = await api.post(
      "/admin/blog-posts",
      formData
    );

    return response.data.data;
  };

export const updateAdminBlogPost =
  async ({
    postId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/blog-posts/${postId}`,
      formData
    );

    return response.data.data;
  };

export const deleteAdminBlogPost =
  async (postId) => {
    const response = await api.delete(
      `/admin/blog-posts/${postId}`
    );

    return response.data;
  };