import crypto from "crypto";

const escapeHtml = (
  value = ""
) => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll(
      "'",
      "&#039;"
    );
};

const preserveLineBreaks = (
  value = ""
) => {
  return escapeHtml(
    value
  ).replace(
    /\r?\n/g,
    "<br />"
  );
};

const getPublicWebUrl = () => {
  const url =
    process.env
      .PUBLIC_WEB_URL ||
    process.env.CLIENT_URLS
      ?.split(",")
      ?.[0] ||
    "http://localhost:5173";

  return url
    .trim()
    .replace(/\/+$/, "");
};

const getBrevoConfig = () => {
  const apiKey =
    process.env.BREVO_API_KEY;

  const senderEmail =
    process.env
      .BREVO_SENDER_EMAIL;

  const senderName =
    process.env
      .BREVO_SENDER_NAME ||
    "Bir Parti";

  if (
    !apiKey ||
    !senderEmail
  ) {
    throw new Error(
      "Brevo API yapılandırması eksik."
    );
  }

  return {
    apiKey,
    senderEmail,
    senderName,
  };
};

const normalizeActionUrl = (
  url = ""
) => {
  if (!url) {
    return "";
  }

  if (
    /^https?:\/\//i.test(
      url
    )
  ) {
    return url;
  }

  return `${getPublicWebUrl()}${url}`;
};

const createPreferenceToken = (
  user
) => {
  const secret =
    process.env
      .EMAIL_PREFERENCE_SECRET;

  if (!secret) {
    throw new Error(
      "EMAIL_PREFERENCE_SECRET eksik."
    );
  }

  const payload =
    Buffer.from(
      JSON.stringify({
        userId:
          String(user._id),
        email: user.email,
      })
    ).toString("base64url");

  const signature = crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
};

export const verifyPreferenceToken = (
  token
) => {
  const secret =
    process.env
      .EMAIL_PREFERENCE_SECRET;

  if (!secret) {
    throw new Error(
      "E-posta tercih sistemi yapılandırılmamış."
    );
  }

  const [
    payload,
    signature,
  ] = String(
    token || ""
  ).split(".");

  if (
    !payload ||
    !signature
  ) {
    throw new Error(
      "Geçersiz tercih bağlantısı."
    );
  }

  const expected = crypto
    .createHmac(
      "sha256",
      secret
    )
    .update(payload)
    .digest("base64url");

  const receivedBuffer =
    Buffer.from(signature);

  const expectedBuffer =
    Buffer.from(expected);

  if (
    receivedBuffer.length !==
      expectedBuffer.length ||
    !crypto.timingSafeEqual(
      receivedBuffer,
      expectedBuffer
    )
  ) {
    throw new Error(
      "Geçersiz tercih bağlantısı."
    );
  }

  return JSON.parse(
    Buffer.from(
      payload,
      "base64url"
    ).toString("utf8")
  );
};

const createIdempotencyKey = (
  campaignId,
  chunkIndex
) => {
  const hex = crypto
    .createHash("sha256")
    .update(
      `${campaignId}:${chunkIndex}`
    )
    .digest("hex");

  const variant =
    (
      (
        Number.parseInt(
          hex[16],
          16
        ) &
        0x3
      ) |
      0x8
    ).toString(16);

  return (
    `${hex.slice(0, 8)}-` +
    `${hex.slice(8, 12)}-` +
    `4${hex.slice(13, 16)}-` +
    `${variant}${hex.slice(
      17,
      20
    )}-` +
    `${hex.slice(20, 32)}`
  );
};

const buildHtml = (
  campaign
) => {
  const actionUrl =
    normalizeActionUrl(
      campaign.actionUrl
    );

  const actionHtml =
    campaign.actionLabel &&
    actionUrl
      ? `
        <p style="margin:28px 0">
          <a
            href="${escapeHtml(
              actionUrl
            )}"
            style="display:inline-block;padding:13px 20px;border-radius:8px;background:#2453ad;color:#ffffff;text-decoration:none;font-weight:700"
          >
            ${escapeHtml(
              campaign
                .actionLabel
            )}
          </a>
        </p>
      `
      : "";

  const unsubscribeHtml =
    campaign.emailType ===
    "announcement"
      ? `
        <p style="margin-top:32px;padding-top:20px;border-top:1px solid #e5eaf2;color:#738098;font-size:12px;line-height:1.6">
          Bu e-posta, Bir Parti duyurularını almak için izin verdiğiniz için gönderildi.
          <a
            href="{{params.unsubscribeUrl}}"
            style="color:#2453ad"
          >
            Duyuru e-postalarından ayrıl
          </a>
        </p>
      `
      : "";

  return `
    <!doctype html>
    <html lang="tr">
      <body style="margin:0;background:#f2f5f9">
        <div style="display:none;max-height:0;overflow:hidden">
          ${escapeHtml(
            campaign.previewText
          )}
        </div>

        <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:34px;color:#17233f;background:#ffffff">
          <p style="color:#2453ad;font-weight:700;letter-spacing:1px">
            BİR PARTİ
          </p>

          <h1 style="font-size:26px;line-height:1.3;color:#0d1d3d">
            ${escapeHtml(
              campaign.subject
            )}
          </h1>

          <p>
            Merhaba {{params.firstName}},
          </p>

          <div style="font-size:15px;line-height:1.75">
            ${preserveLineBreaks(
              campaign.body
            )}
          </div>

          ${actionHtml}
          ${unsubscribeHtml}
        </div>
      </body>
    </html>
  `;
};

const sendBrevoRequest =
  async ({
    payload,
    idempotencyKey,
  }) => {
    const {
      apiKey,
    } = getBrevoConfig();

    const response =
      await fetch(
        "https://api.brevo.com/v3/smtp/email",
        {
          method: "POST",

          headers: {
            accept:
              "application/json",

            "content-type":
              "application/json",

            "api-key":
              apiKey,

            ...(idempotencyKey && {
              idempotencyKey,
            }),
          },

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    const responseText =
      await response.text();

    let responseData = {};

    if (responseText) {
      try {
        responseData =
          JSON.parse(
            responseText
          );
      } catch {
        responseData = {
          message:
            responseText,
        };
      }
    }

    if (!response.ok) {
      throw new Error(
        responseData.message ||
          `Brevo gönderim hatası: ${response.status}`
      );
    }

    return responseData;
  };

const createMessageVersion = ({
  user,
  campaign,
  isTest = false,
}) => {
  const unsubscribeUrl =
    campaign.emailType ===
    "announcement"
      ? isTest
        ? "#"
        : `${getPublicWebUrl()}/e-posta-tercihi/${createPreferenceToken(
            user
          )}`
      : "";

  return {
    to: [
      {
        email: user.email,

        name:
          `${user.firstName} ${user.lastName}`.trim(),
      },
    ],

    params: {
      firstName:
        user.firstName ||
        "Üyemiz",

      unsubscribeUrl,
    },
  };
};

const buildPayload = ({
  campaign,
  users,
  isTest = false,
}) => {
  const {
    senderEmail,
    senderName,
  } = getBrevoConfig();

  return {
    sender: {
      email: senderEmail,
      name: senderName,
    },

    subject: isTest
      ? `[TEST] ${campaign.subject}`
      : campaign.subject,

    htmlContent:
      buildHtml(campaign),

    messageVersions:
      users.map((user) =>
        createMessageVersion({
          user,
          campaign,
          isTest,
        })
      ),
  };
};

export const sendBulkEmailTest =
  async ({
    campaign,
    user,
  }) => {
    const payload =
      buildPayload({
        campaign,
        users: [user],
        isTest: true,
      });

    return sendBrevoRequest({
      payload,
      idempotencyKey:
        crypto.randomUUID(),
    });
  };

export const sendBulkEmailCampaign =
  async ({
    campaign,
    users,
  }) => {
    const chunkSize = 500;

    const messageIds = [];
    let sentCount = 0;

    for (
      let index = 0;
      index < users.length;
      index += chunkSize
    ) {
      const chunk =
        users.slice(
          index,
          index + chunkSize
        );

      const chunkIndex =
        Math.floor(
          index / chunkSize
        );

      const payload =
        buildPayload({
          campaign,
          users: chunk,
        });

      try {
        const result =
          await sendBrevoRequest({
            payload,

            idempotencyKey:
              createIdempotencyKey(
                campaign._id,
                chunkIndex
              ),
          });

        if (
          Array.isArray(
            result.messageIds
          )
        ) {
          messageIds.push(
            ...result.messageIds
          );
        }

        sentCount +=
          chunk.length;
      } catch (error) {
        error.deliveryProgress = {
          sentCount,
          messageIds,
        };

        throw error;
      }
    }

    return {
      sentCount,
      messageIds,
    };
  };