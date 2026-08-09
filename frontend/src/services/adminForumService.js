import api from "./api";

export const getAdminForumOverview = async () => {
  const response = await api.get(
    "/admin/forum/overview"
  );

  return response.data.data;
};

export const getAdminForumCategories = async () => {
  const response = await api.get(
    "/admin/forum/categories"
  );

  return response.data.data;
};

export const createAdminForumCategory = async (
  formData
) => {
  const response = await api.post(
    "/admin/forum/categories",
    formData
  );

  return response.data.data;
};

export const updateAdminForumCategory = async ({
  categoryId,
  formData,
}) => {
  const response = await api.patch(
    `/admin/forum/categories/${categoryId}`,
    formData
  );

  return response.data.data;
};

export const deleteAdminForumCategory = async (
  categoryId
) => {
  const response = await api.delete(
    `/admin/forum/categories/${categoryId}`
  );

  return response.data;
};

export const getAdminForumTopics = async ({
  page = 1,
  search = "",
  category = "",
  status = "",
  approvalStatus = "",
  pinned = "",
} = {}) => {
  const response = await api.get(
    "/admin/forum/topics",
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

        ...(approvalStatus && {
          approvalStatus,
        }),

        ...(pinned !== "" && {
          pinned,
        }),
      },
    }
  );

  return response.data.data;
};

export const getAdminForumTopicById = async (
  topicId
) => {
  const response = await api.get(
    `/admin/forum/topics/${topicId}`
  );

  return response.data.data;
};

export const updateAdminForumTopicModeration =
  async ({
    topicId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/forum/topics/${topicId}/moderation`,
      formData
    );

    return response.data.data;
  };



  export const getAdminForumTopicReplies =
  async ({
    topicId,
    page = 1,
  }) => {
    const response = await api.get(
      `/admin/forum/topics/${topicId}/replies`,
      {
        params: {
          page,
        },
      }
    );

    return response.data.data;
  };

export const updateAdminForumReplyModeration =
  async ({
    replyId,
    status,
  }) => {
    const response = await api.patch(
      `/admin/forum/replies/${replyId}/moderation`,
      {
        status,
      }
    );

    return response.data.data;
  };


  export const getAdminForumReportOverview =
  async () => {
    const response =
      await api.get(
        "/admin/forum/reports/overview"
      );

    return response.data.data;
  };

export const getAdminForumReports =
  async ({
    page = 1,
    search = "",
    status = "",
    targetType = "",
    reason = "",
  } = {}) => {
    const response =
      await api.get(
        "/admin/forum/reports",
        {
          params: {
            page,

            ...(search && {
              search,
            }),

            ...(status && {
              status,
            }),

            ...(targetType && {
              targetType,
            }),

            ...(reason && {
              reason,
            }),
          },
        }
      );

    return response.data.data;
  };

export const updateAdminForumReport =
  async ({
    reportId,
    status,
    resolutionNote = "",
  }) => {
    const response =
      await api.patch(
        `/admin/forum/reports/${reportId}`,
        {
          status,
          resolutionNote,
        }
      );

    return response.data.data;
  };