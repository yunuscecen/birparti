import { z } from "zod";

const optionalUrlSchema = z
  .string()
  .trim()
  .max(
    1000,
    "Bağlantı adresi çok uzun."
  )
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      try {
        const url =
          new URL(value);

        return [
          "http:",
          "https:",
        ].includes(
          url.protocol
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Geçerli bir internet adresi girin.",
    }
  );

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(
    30,
    "Telefon numarası çok uzun."
  )
  .refine(
    (value) =>
      !value ||
      /^[0-9+\s()-]+$/.test(
        value
      ),
    {
      message:
        "Geçerli bir telefon numarası girin.",
    }
  );


const siteImageSchema =
  z.object({
    url:
      optionalUrlSchema,

    publicId: z
      .string()
      .trim()
      .max(
        500,
        "Görsel kimliği çok uzun."
      )
      .optional()
      .default(""),

    alt: z
      .string()
      .trim()
      .max(
        180,
        "Görsel açıklaması çok uzun."
      )
      .optional()
      .default(""),
  });

export const updateSiteSettingSchema =
  z
    .object({
        branding: z.object({
  logo: siteImageSchema,
  favicon: siteImageSchema,
}),
      identity: z.object({
        siteName: z
          .string()
          .trim()
          .min(
            2,
            "Site adı en az 2 karakter olmalıdır."
          )
          .max(
            100,
            "Site adı en fazla 100 karakter olabilir."
          ),

        shortName: z
          .string()
          .trim()
          .min(
            2,
            "Kısa site adı en az 2 karakter olmalıdır."
          )
          .max(
            80,
            "Kısa site adı en fazla 80 karakter olabilir."
          ),

        description: z
          .string()
          .trim()
          .max(
            500,
            "Site açıklaması en fazla 500 karakter olabilir."
          )
          .optional()
          .default(""),
      }),

      contact: z.object({
        email: z
          .string()
          .trim()
          .email(
            "Geçerli bir iletişim e-postası girin."
          )
          .max(
            254,
            "E-posta adresi çok uzun."
          )
          .transform(
            (value) =>
              value.toLowerCase()
          ),

        phone:
          optionalPhoneSchema,

        address: z
          .string()
          .trim()
          .max(
            500,
            "Adres en fazla 500 karakter olabilir."
          )
          .optional()
          .default(""),
      }),

      footer: z.object({
        primaryText: z
          .string()
          .trim()
          .max(
            200,
            "Footer ana metni çok uzun."
          )
          .optional()
          .default(""),

        secondaryText: z
          .string()
          .trim()
          .max(
            200,
            "Footer ikinci metni çok uzun."
          )
          .optional()
          .default(""),

        copyrightText: z
          .string()
          .trim()
          .max(
            200,
            "Telif hakkı metni çok uzun."
          )
          .optional()
          .default(""),
      }),

      socialLinks: z.object({
        instagram:
          optionalUrlSchema,

        facebook:
          optionalUrlSchema,

        x:
          optionalUrlSchema,

        youtube:
          optionalUrlSchema,

        linkedin:
          optionalUrlSchema,
      }),

      features: z.object({
        maintenanceMode:
          z.boolean(),

        registrationsEnabled:
          z.boolean(),

        forumEnabled:
          z.boolean(),
      }),

      maintenanceMessage: z
        .string()
        .trim()
        .max(
          500,
          "Bakım mesajı en fazla 500 karakter olabilir."
        )
        .optional()
        .default(""),
    })
    .superRefine(
      (data, context) => {
        if (
          data.features
            .maintenanceMode &&
          data.maintenanceMessage
            .length < 10
        ) {
          context.addIssue({
            code: "custom",

            path: [
              "maintenanceMessage",
            ],

            message:
              "Bakım modu açıkken en az 10 karakterlik bir bakım mesajı girilmelidir.",
          });
        }
      }
    );