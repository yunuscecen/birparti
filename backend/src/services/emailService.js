import nodemailer from "nodemailer";

let transporter = null;

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const preserveLineBreaks = (value = "") => {
  return escapeHtml(value).replace(
    /\r?\n/g,
    "<br />"
  );
};

const oneLine = (value = "") => {
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .trim();
};

const getPublicWebUrl = () => {
  const configuredUrl =
    process.env.PUBLIC_WEB_URL ||
    process.env.CLIENT_URLS
      ?.split(",")
      ?.[0] ||
    "http://localhost:5173";

  return configuredUrl
    .trim()
    .replace(/\/+$/, "");
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;

  const port = Number(
    process.env.SMTP_PORT || 587
  );

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP yapılandırması eksik."
    );
  }

  const secure =
    port === 465 ||
    String(
      process.env.SMTP_SECURE || ""
    ).toLowerCase() === "true";

  transporter =
    nodemailer.createTransport({
      host,
      port,
      secure,

      auth: {
        user,
        pass,
      },

      pool: true,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

  return transporter;
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  replyTo,
}) => {
  const mailer = getTransporter();

  return mailer.sendMail({
    from:
      process.env.MAIL_FROM ||
      process.env.SMTP_USER,

    to,
    subject,
    text,
    html,

    ...(replyTo && {
      replyTo,
    }),
  });
};

const getRequestCode = (request) => {
  return String(request._id)
    .slice(-8)
    .toUpperCase();
};

const requestTypeLabels = {
  suggestion: "Öneri",
  opinion: "Görüş",
  complaint: "Şikâyet",
  technical: "Teknik Destek",
  other: "Diğer",
};

export const sendPasswordResetEmail =
  async ({
    to,
    firstName,
    resetUrl,
  }) => {
    const safeName = escapeHtml(
      firstName || "Üyemiz"
    );

    const safeUrl = escapeHtml(
      resetUrl
    );

    await sendEmail({
      to,

      subject:
        "Bir Parti şifre sıfırlama bağlantısı",

      text:
        `Merhaba ${firstName || ""}, ` +
        `şifrenizi sıfırlamak için şu bağlantıyı kullanın: ${resetUrl}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#17233f">
          <h1 style="color:#0d1d3d">
            Şifrenizi sıfırlayın
          </h1>

          <p>Merhaba ${safeName},</p>

          <p>
            Bir Parti hesabınız için şifre sıfırlama talebi aldık.
          </p>

          <p style="margin:28px 0">
            <a
              href="${safeUrl}"
              style="display:inline-block;padding:13px 20px;border-radius:8px;background:#2453ad;color:#ffffff;text-decoration:none;font-weight:700"
            >
              Şifremi Sıfırla
            </a>
          </p>

          <p>
            Talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.
          </p>
        </div>
      `,
    });
  };

export const sendContactRequestCreatedEmails =
  async (request) => {
    const requestCode =
      getRequestCode(request);

    const safeName = escapeHtml(
      request.fullName
    );

    const safeSubject = escapeHtml(
      request.subject
    );

    const adminEmail = String(
      process.env
        .CONTACT_NOTIFICATION_EMAIL ||
        ""
    ).trim();

    const emailTasks = [
      sendEmail({
        to: request.email,

        subject:
          "Talebinizi aldık | Bir Parti",

        text:
          `Merhaba ${request.fullName}, ` +
          `“${request.subject}” başlıklı talebinizi aldık. ` +
          `Talep numaranız: ${requestCode}.`,

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#17233f">
            <p style="color:#2453ad;font-weight:700">
              BİR PARTİ
            </p>

            <h1>Talebinizi aldık</h1>

            <p>Merhaba ${safeName},</p>

            <p>
              <strong>${safeSubject}</strong> başlıklı talebiniz sistemimize kaydedildi.
            </p>

            <p>
              Talep numaranız:
              <strong>${requestCode}</strong>
            </p>

            <p>
              Talebiniz incelendikten sonra size bilgi vereceğiz.
            </p>
          </div>
        `,
      }),
    ];

    if (adminEmail) {
      const adminUrl =
        `${getPublicWebUrl()}` +
        `/admin/talepler/${request._id}`;

      emailTasks.push(
        sendEmail({
          to: adminEmail,
          replyTo: request.email,

          subject:
            `[Yeni Talep] ${oneLine(
              request.subject
            )}`,

          text:
            `Yeni iletişim talebi\n\n` +
            `Ad Soyad: ${request.fullName}\n` +
            `E-posta: ${request.email}\n` +
            `Tür: ${
              requestTypeLabels[
                request.type
              ] || request.type
            }\n` +
            `Konu: ${request.subject}\n\n` +
            `${request.message}\n\n` +
            `Yönetim bağlantısı: ${adminUrl}`,

          html: `
            <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:32px;color:#17233f">
              <h1>Yeni iletişim talebi</h1>

              <p>
                <strong>Talep:</strong>
                ${requestCode}
              </p>

              <p>
                <strong>Ad Soyad:</strong>
                ${escapeHtml(
                  request.fullName
                )}
              </p>

              <p>
                <strong>E-posta:</strong>
                ${escapeHtml(
                  request.email
                )}
              </p>

              <p>
                <strong>Tür:</strong>
                ${escapeHtml(
                  requestTypeLabels[
                    request.type
                  ] || request.type
                )}
              </p>

              <p>
                <strong>Konu:</strong>
                ${safeSubject}
              </p>

              <div style="margin:24px 0;padding:18px;border-radius:10px;background:#f3f6fb">
                ${preserveLineBreaks(
                  request.message
                )}
              </div>

              <a
                href="${escapeHtml(
                  adminUrl
                )}"
                style="display:inline-block;padding:13px 20px;border-radius:8px;background:#2453ad;color:#ffffff;text-decoration:none;font-weight:700"
              >
                Talebi Yönet
              </a>
            </div>
          `,
        })
      );
    }

    const results =
      await Promise.allSettled(
        emailTasks
      );

    results.forEach((result) => {
      if (
        result.status ===
        "rejected"
      ) {
        console.error(
          "Contact request email error:",
          result.reason
        );
      }
    });
  };

export const sendContactRequestResponseEmail =
  async (request) => {
    const requestCode =
      getRequestCode(request);

    const accountUrl = request.user
      ? `${getPublicWebUrl()}/hesabim/taleplerim`
      : `${getPublicWebUrl()}/iletisim`;

    const [result] =
      await Promise.allSettled([
        sendEmail({
          to: request.email,

          subject:
            `Talebiniz yanıtlandı: ${oneLine(
              request.subject
            )}`,

          text:
            `Merhaba ${request.fullName},\n\n` +
            `“${request.subject}” başlıklı talebiniz yanıtlandı.\n\n` +
            `${request.publicResponse}\n\n` +
            `Talep numarası: ${requestCode}`,

          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#17233f">
              <p style="color:#2453ad;font-weight:700">
                BİR PARTİ
              </p>

              <h1>Talebiniz yanıtlandı</h1>

              <p>
                Merhaba ${escapeHtml(
                  request.fullName
                )},
              </p>

              <p>
                <strong>${escapeHtml(
                  request.subject
                )}</strong>
                başlıklı talebinize yanıt verildi.
              </p>

              <div style="margin:24px 0;padding:20px;border-radius:10px;background:#f3f6fb">
                ${preserveLineBreaks(
                  request.publicResponse
                )}
              </div>

              <p>
                Talep numarası:
                <strong>${requestCode}</strong>
              </p>

              <a
                href="${escapeHtml(
                  accountUrl
                )}"
                style="display:inline-block;margin-top:12px;padding:13px 20px;border-radius:8px;background:#2453ad;color:#ffffff;text-decoration:none;font-weight:700"
              >
                Talebi Görüntüle
              </a>
            </div>
          `,
        }),
      ]);

    if (result.status === "rejected") {
      console.error(
        "Contact response email error:",
        result.reason
      );
    }
  };


  export const sendEmailVerificationEmail =
  async ({
    to,
    firstName,
    verificationUrl,
  }) => {
    const safeName = escapeHtml(
      firstName || "Üyemiz"
    );

    const safeUrl = escapeHtml(
      verificationUrl
    );

    await sendEmail({
      to,

      subject:
        "E-posta adresinizi doğrulayın | Bir Parti",

      text:
        `Merhaba ${firstName || ""}, ` +
        `e-posta adresinizi doğrulamak için bağlantıyı açın: ${verificationUrl}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#17233f">
          <p style="color:#2453ad;font-weight:700">
            BİR PARTİ
          </p>

          <h1>
            E-posta adresinizi doğrulayın
          </h1>

          <p>
            Merhaba ${safeName},
          </p>

          <p>
            Üyeliğinize ait e-posta adresini doğrulamak için aşağıdaki butona tıklayın.
          </p>

          <p style="margin:28px 0">
            <a
              href="${safeUrl}"
              style="display:inline-block;padding:13px 20px;border-radius:8px;background:#2453ad;color:#ffffff;text-decoration:none;font-weight:700"
            >
              E-postamı Doğrula
            </a>
          </p>

          <p>
            Bu işlemi siz başlatmadıysanız e-postayı yok sayabilirsiniz.
          </p>
        </div>
      `,
    });
  };