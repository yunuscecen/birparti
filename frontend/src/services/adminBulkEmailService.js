import api from "./api";

const getRecipientIds = (
  selectedRecipients = []
) =>
  selectedRecipients
    .map((recipient) =>
      typeof recipient === "string"
        ? recipient
        : recipient?._id
    )
    .filter(Boolean);

export const getBulkEmailAudienceCount =
  async ({
    emailType = "announcement",
    audienceMode = "all",
    roles = [],
    selectedRecipients = [],
  } = {}) => {
    const recipientIds =
      getRecipientIds(
        selectedRecipients
      );

    const response = await api.get(
      "/admin/bulk-emails/audience-count",
      {
        params: {
          emailType,
          audienceMode,

          ...(roles.length > 0 && {
            roles: roles.join(","),
          }),

          ...(recipientIds.length >
            0 && {
            userIds:
              recipientIds.join(","),
          }),
        },
      }
    );

    return response.data.data;
  };

export const getBulkEmailRecipientOptions =
  async ({
    search = "",
    emailType = "announcement",
  } = {}) => {
    const response = await api.get(
      "/admin/bulk-emails/recipient-options",
      {
        params: {
          search,
          emailType,
        },
      }
    );

    return response.data.data;
  };

export const getAdminBulkEmailCampaigns =
  async ({ page = 1 } = {}) => {
    const response = await api.get(
      "/admin/bulk-emails",
      {
        params: { page },
      }
    );

    return response.data.data;
  };

export const createAdminBulkEmailCampaign =
  async (formData) => {
    const response = await api.post(
      "/admin/bulk-emails",
      formData
    );

    return {
      ...response.data.data,
      message: response.data.message,
    };
  };

export const updateAdminBulkEmailCampaign =
  async ({
    campaignId,
    formData,
  }) => {
    const response = await api.patch(
      `/admin/bulk-emails/${campaignId}`,
      formData
    );

    return {
      ...response.data.data,
      message: response.data.message,
    };
  };

export const sendAdminBulkEmailTest =
  async (campaignId) => {
    const response = await api.post(
      `/admin/bulk-emails/${campaignId}/test`
    );

    return response.data;
  };

export const sendAdminBulkEmailCampaign =
  async (campaignId) => {
    const response = await api.post(
      `/admin/bulk-emails/${campaignId}/send`,
      {
        confirmation: "GONDER",
      },
      {
        timeout: 120000,
      }
    );

    return {
      ...response.data.data,
      message: response.data.message,
    };
  };

export const unsubscribeMarketingEmails =
  async (token) => {
    const response = await api.post(
      `/email-preferences/unsubscribe/${token}`
    );

    return response.data;
  };