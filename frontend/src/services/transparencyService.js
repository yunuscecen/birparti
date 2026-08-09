import api from "./api";

export const getPublicTransparency =
  async ({
    year,
  }) => {
    const response = await api.get(
      "/transparency",
      {
        params: {
          year,
        },
      }
    );

    return response.data.data;
  };

  export const getAdminTransparencyRecords =
  async ({
    page = 1,
    search = "",
    type = "",
    status = "",
  } = {}) => {
    const response = await api.get(
      "/admin/transparency",
      {
        params: {
          page,

          ...(search && {
            search,
          }),

          ...(type && {
            type,
          }),

          ...(status && {
            status,
          }),
        },
      }
    );

    return response.data.data;
  };

export const createAdminTransparencyRecord =
  async (formData) => {
    const response = await api.post(
      "/admin/transparency",
      formData
    );

    return response.data.data;
  };

export const updateAdminTransparencyRecord =
  async ({
    recordId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/transparency/${recordId}`,
      formData
    );

    return response.data.data;
  };