import api from "./api";

export const getBlogCategories = async () => {
  const response = await api.get(
    "/blog-categories"
  );

  return response.data.data;
};

export const getBlogPosts = async ({
  page = 1,
  search = "",
  category = "",
} = {}) => {
  const response = await api.get(
    "/blog-posts",
    {
      params: {
        page,

        ...(search && {
          search,
        }),

        ...(category && {
          category,
        }),
      },
    }
  );

  return response.data.data;
};

export const getBlogPostBySlug = async (
  slug
) => {
  const response = await api.get(
    `/blog-posts/${slug}`
  );

  return response.data.data;
};