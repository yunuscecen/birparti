import api from "./api";

export const createContactRequest =
  async (formData) => {
    const response =
      await api.post(
        "/contact-requests",
        formData
      );

    return response.data;
  };

export const createAccountContactRequest =
  async (formData) => {
    const response =
      await api.post(
        "/account/contact-requests",
        formData
      );

    return response.data;
  };

export const getMyContactRequests =
  async ({
    page = 1,
    status = "",
  } = {}) => {
    const response =
      await api.get(
        "/account/contact-requests",
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