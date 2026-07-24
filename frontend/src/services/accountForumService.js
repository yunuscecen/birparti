import api from "./api";

export const getMyForumOverview =
  async () => {
    const response = await api.get(
      "/account/forum/overview"
    );

    return response.data.data;
  };

export const getMyForumTopics =
  async ({
    page = 1,
    status = "",
  } = {}) => {
    const response = await api.get(
      "/account/forum/topics",
      {
        params: {
          page,

          ...(status && {
            status,
          }),
        },
      }
    );

    return response.data.data;
  };

export const getMyForumReplies =
  async ({
    page = 1,
    status = "",
  } = {}) => {
    const response = await api.get(
      "/account/forum/replies",
      {
        params: {
          page,

          ...(status && {
            status,
          }),
        },
      }
    );

    return response.data.data;
  };