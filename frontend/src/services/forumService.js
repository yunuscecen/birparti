import api from "./api";

export const getForumCategories = async () => {
  const response = await api.get(
    "/forum-categories"
  );

  return response.data.data;
};

export const getForumTopics = async ({
  page = 1,
  search = "",
  category = "",
} = {}) => {
  const response = await api.get(
    "/forum-topics",
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

export const getForumTopicBySlug = async ({
  slug,
  page = 1,
}) => {
  const response = await api.get(
    `/forum-topics/${slug}`,
    {
      params: {
        page,
      },
    }
  );

  return response.data.data;
};

export const createForumTopic =
  async (formData) => {
    const response = await api.post(
      "/forum-topics",
      formData
    );

    return response.data.data;
  };

export const createForumReply =
  async ({
    slug,
    body,
    replyToReplyId = null,
  }) => {
    const response = await api.post(
      `/forum-topics/${slug}/replies`,
      {
        body,

        ...(replyToReplyId && {
          replyToReplyId,
        }),
      }
    );

    return response.data.data;
  };


  export const reportForumContent =
  async ({
    targetType,
    targetId,
    reason,
    description = "",
  }) => {
    const response =
      await api.post(
        "/forum-reports",
        {
          targetType,
          targetId,
          reason,
          description,
        }
      );

    return response.data.data;
  };