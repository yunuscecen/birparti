import nodemailer from "nodemailer";

let transporter = null;

const escapeHtml = (
  value = ""
) => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host =
    process.env.SMTP_HOST;

  const port =
    Number(
      process.env.SMTP_PORT ||
        587
    );

  const user =
    process.env.SMTP_USER;

  const pass =
    process.env.SMTP_PASS;

  if (
    !host ||
    !user ||
    !pass
  ) {
    throw new Error(
      "SMTP yapılandırması eksik."
    );
  }

  const secure =
    port === 465 ||
    String(
      process.env
        .SMTP_SECURE || ""
    ).toLowerCase() ===
      "true";

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

export const sendPasswordResetEmail =
  async ({
    to,
    firstName,
    resetUrl,
  }) => {
    const mailer =
      getTransporter();

    const safeName =
      escapeHtml(
        firstName || "Üyemiz"
      );

    const safeUrl =
      escapeHtml(resetUrl);

    await mailer.sendMail({
      from:
        process.env.MAIL_FROM ||
        process.env.SMTP_USER,

      to,

      subject:
        "Bir Parti şifre sıfırlama bağlantısı",

      text:
        `Merhaba ${firstName || ""}, şifrenizi sıfırlamak için şu bağlantıyı kullanın: ${resetUrl}`,

      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#17233f">
          <h1 style="color:#0d1d3d">
            Şifrenizi sıfırlayın
          </h1>

          <p>
            Merhaba ${safeName},
          </p>

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
            Bu bağlantı sınırlı bir süre geçerlidir. Talebi siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.
          </p>
        </div>
      `,
    });
  };