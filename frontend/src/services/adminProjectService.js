import api from "./api";

export const getAdminProjectCategories =
  async () => {
    const response = await api.get(
      "/admin/project-categories"
    );

    return response.data.data;
  };

export const createAdminProjectCategory =
  async (formData) => {
    const response = await api.post(
      "/admin/project-categories",
      formData
    );

    return response.data.data;
  };

export const updateAdminProjectCategory =
  async ({
    categoryId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/project-categories/${categoryId}`,
      formData
    );

    return response.data.data;
  };

export const deleteAdminProjectCategory =
  async (categoryId) => {
    const response = await api.delete(
      `/admin/project-categories/${categoryId}`
    );

    return response.data;
  };

export const getAdminProjects = async ({
  page = 1,
  search = "",
  status = "",
  category = "",
} = {}) => {
  const response = await api.get(
    "/admin/projects",
    {
      params: {
        page,

        ...(search && {
          search,
        }),

        ...(status && {
          status,
        }),

        ...(category && {
          category,
        }),
      },
    }
  );

  return response.data.data;
};

export const getAdminProjectById =
  async (projectId) => {
    const response = await api.get(
      `/admin/projects/${projectId}`
    );

    return response.data.data;
  };

export const createAdminProject =
  async (formData) => {
    const response = await api.post(
      "/admin/projects",
      formData
    );

    return response.data.data;
  };

export const updateAdminProject =
  async ({
    projectId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/projects/${projectId}`,
      formData
    );

    return response.data.data;
  };

export const deleteAdminProject =
  async (projectId) => {
    const response = await api.delete(
      `/admin/projects/${projectId}`
    );

    return response.data;
  };