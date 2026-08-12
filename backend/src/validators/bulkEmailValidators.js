import { z } from "zod";

const roleSchema = z.enum([
  "member",
  "moderator",
  "contentEditor",
  "financeManager",
  "admin",
  "superAdmin",
]);

const actionUrlSchema = z
  .string()
  .trim()
  .max(
    500,
    "Buton bağlantısı çok uzun."
  )
  .refine(
    (value) =>
      !value ||
      value.startsWith("/") ||
      /^https?:\/\//i.test(value),
    {
      message:
        "Buton bağlantısı / ile veya http:// ya da https:// ile başlamalıdır.",
    }
  );

export const bulkEmailCampaignSchema =
  z
    .object({
      name: z
        .string()
        .trim()
        .min(
          3,
          "Kampanya adı en az 3 karakter olmalıdır."
        )
        .max(120),

      emailType: z.enum([
        "announcement",
        "system",
      ]),

      subject: z
        .string()
        .trim()
        .min(
          3,
          "E-posta konusu en az 3 karakter olmalıdır."
        )
        .max(180),

      previewText: z
        .string()
        .trim()
        .max(200)
        .optional()
        .default(""),

      body: z
        .string()
        .trim()
        .min(
          10,
          "E-posta içeriği en az 10 karakter olmalıdır."
        )
        .max(20000),

      actionLabel: z
        .string()
        .trim()
        .max(80)
        .optional()
        .default(""),

      actionUrl:
        actionUrlSchema
          .optional()
          .default(""),

      audienceRoles: z
        .array(roleSchema)
        .max(6)
        .optional()
        .default([]),
    })
    .superRefine(
      (data, context) => {
        if (
          data.actionLabel &&
          !data.actionUrl
        ) {
          context.addIssue({
            code: "custom",
            path: ["actionUrl"],
            message:
              "Buton yazısı girildiyse bağlantı da girilmelidir.",
          });
        }

        if (
          data.actionUrl &&
          !data.actionLabel
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "actionLabel",
            ],
            message:
              "Buton bağlantısı girildiyse buton yazısı da girilmelidir.",
          });
        }
      }
    );

export const sendBulkEmailSchema =
  z.object({
    confirmation: z.literal(
      "GONDER",
      {
        message:
          "Gönderimi onaylamak için GONDER yazılmalıdır.",
      }
    ),
  });