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
    approvalStatus = "",
  } = {}) => {
    const response = await api.get(
      "/account/forum/topics",
      {
        params: {
          page,

          ...(status && {
            status,
          }),

          ...(approvalStatus && {
            approvalStatus,
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

  export const getMyForumNotifications =
  async ({
    page = 1,
    limit = 15,
    unreadOnly = false,
  } = {}) => {
    const response = await api.get(
      "/account/forum/notifications",
      {
        params: {
          page,
          limit,

          ...(unreadOnly && {
            unreadOnly: true,
          }),
        },
      }
    );

    return response.data.data;
  };

export const markForumNotificationRead =
  async (notificationId) => {
    const response = await api.patch(
      `/account/forum/notifications/${notificationId}/read`
    );

    return response.data.data;
  };

export const markAllForumNotificationsRead =
  async () => {
    const response = await api.patch(
      "/account/forum/notifications/read-all"
    );

    return response.data;
  };


  export const getMyForumReports =
  async ({
    page = 1,
    status = "",
    targetType = "",
  } = {}) => {
    const response = await api.get(
      "/account/forum/reports",
      {
        params: {
          page,

          ...(status && {
            status,
          }),

          ...(targetType && {
            targetType,
          }),
        },
      }
    );

    return response.data.data;
  };


  export const getMyForumTopicForEdit =
  async (topicId) => {
    const response =
      await api.get(
        `/account/forum/topics/${topicId}/edit`
      );

    return response.data.data;
  };

export const updateMyForumTopic =
  async ({
    topicId,
    formData,
  }) => {
    const response =
      await api.patch(
        `/account/forum/topics/${topicId}/edit`,
        formData
      );

    return response.data.data;
  };

export const getMyForumReplyForEdit =
  async (replyId) => {
    const response =
      await api.get(
        `/account/forum/replies/${replyId}/edit`
      );

    return response.data.data;
  };

export const updateMyForumReply =
  async ({
    replyId,
    body,
  }) => {
    const response =
      await api.patch(
        `/account/forum/replies/${replyId}/edit`,
        {
          body,
        }
      );

    return response.data.data;
  };


  export const deleteMyForumTopic =
  async (topicId) => {
    const response =
      await api.delete(
        `/account/forum/topics/${topicId}`
      );

    return response.data;
  };

export const deleteMyForumReply =
  async (replyId) => {
    const response =
      await api.delete(
        `/account/forum/replies/${replyId}`
      );

    return response.data;
  };