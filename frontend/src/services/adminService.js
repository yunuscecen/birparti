import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get(
    "/admin/dashboard"
  );

  return response.data.data;
};

export const getAdminUsers = async ({
  page = 1,
  limit = 12,
  search = "",
  role = "",
  status = "",
} = {}) => {
  const response = await api.get(
    "/admin/users",
    {
      params: {
        page,
        limit,
        ...(search && {
          search,
        }),
        ...(role && {
          role,
        }),
        ...(status && {
          status,
        }),
      },
    }
  );

  return response.data.data;
};

export const updateAdminUserStatus = async ({
  userId,
  status,
}) => {
  const response = await api.patch(
    `/admin/users/${userId}/status`,
    {
      status,
    }
  );

  return response.data.data;
};

export const updateAdminUserForumPermission =
  async ({
    userId,
    canCreateTopic,
  }) => {
    const response = await api.patch(
      `/admin/users/${userId}/forum-permission`,
      {
        canCreateTopic,
      }
    );

    return response.data.data;
  };

export const updateAdminUserRole = async ({
  userId,
  role,
}) => {
  const response = await api.patch(
    `/admin/users/${userId}/role`,
    {
      role,
    }
  );

  return response.data.data;
};