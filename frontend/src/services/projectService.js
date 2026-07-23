import api from "./api";

export const getProjects = async ({
  category = "",
  search = "",
} = {}) => {
  const response = await api.get("/projects", {
    params: {
      ...(category && {
        category,
      }),
      ...(search && {
        search,
      }),
    },
  });

  return response.data;
};

export const getProjectBySlug = async (slug) => {
  const response = await api.get(`/projects/${slug}`);

  return response.data;
};

export const getProjectCategories = async () => {
  const response = await api.get("/project-categories");

  return response.data;
};