import api from "./api";

export const getAdminContactRequests =
  async ({
    page = 1,
    search = "",
    status = "",
    type = "",
    priority = "",
    archived = "false",
  } = {}) => {
    const response =
      await api.get(
        "/admin/contact-requests",
        {
          params: {
            page,
            archived,

            ...(search && {
              search,
            }),

            ...(status && {
              status,
            }),

            ...(type && {
              type,
            }),

            ...(priority && {
              priority,
            }),
          },
        }
      );

    return response.data.data;
  };

export const getAdminContactRequestById =
  async (requestId) => {
    const response =
      await api.get(
        `/admin/contact-requests/${requestId}`
      );

    return response.data.data;
  };

export const updateAdminContactRequest =
  async ({
    requestId,
    formData,
  }) => {
    const response =
      await api.patch(
        `/admin/contact-requests/${requestId}`,
        formData
      );

    return response.data.data;
  };