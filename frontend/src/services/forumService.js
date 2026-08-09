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
  sort = "newest",
} = {}) => {
  const response = await api.get(
    "/forum-topics",
    {
      params: {
        page,
        sort,

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

  export const getMyForumTopicInteraction =
  async (slug) => {
    const response = await api.get(
      `/forum-topics/${slug}/interaction`
    );

    return response.data.data;
  };

export const updateForumTopicVote =
  async ({
    slug,
    vote,
  }) => {
    const response =
      await api.patch(
        `/forum-topics/${slug}/vote`,
        {
          vote,
        }
      );

    return response.data.data;
  };

export const updateForumTopicSupport =
  async ({
    slug,
    isSupported,
  }) => {
    const response =
      await api.patch(
        `/forum-topics/${slug}/support`,
        {
          isSupported,
        }
      );

    return response.data.data;
  };

export const updateForumTopicSolvedStatus =
  async ({
    slug,
    isSolved,
  }) => {
    const response =
      await api.patch(
        `/forum-topics/${slug}/solved`,
        {
          isSolved,
        }
      );

    return response.data.data;
  };