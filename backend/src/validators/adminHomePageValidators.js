import { z } from "zod";

const linkPathSchema = z
  .string()
  .trim()
  .min(1, "Bağlantı adresi zorunludur.")
  .max(300, "Bağlantı adresi çok uzun.")
  .refine(
    (value) => {
      if (value.startsWith("/")) {
        return true;
      }

      try {
        const url = new URL(value);

        return ["http:", "https:"].includes(
          url.protocol
        );
      } catch {
        return false;
      }
    },
    {
      message:
        "Bağlantı /projelerimiz gibi site içi veya geçerli bir internet adresi olmalıdır.",
    }
  );

const buttonSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Buton yazısı zorunludur.")
    .max(80, "Buton yazısı çok uzun."),

  path: linkPathSchema,
});

const featureCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Kart başlığı en az 2 karakter olmalıdır.")
    .max(160, "Kart başlığı çok uzun."),

  description: z
    .string()
    .trim()
    .min(5, "Kart açıklaması en az 5 karakter olmalıdır.")
    .max(1200, "Kart açıklaması çok uzun."),

  buttonLabel: z
    .string()
    .trim()
    .min(1, "Kart buton yazısı zorunludur.")
    .max(80, "Kart buton yazısı çok uzun."),

  path: linkPathSchema,

  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),
});

export const updateAdminHomePageSchema =
  z.object({
    hero: z.object({
      eyebrow: z
        .string()
        .trim()
        .max(100)
        .optional()
        .default(""),

      titleFirst: z
        .string()
        .trim()
        .min(2, "Ana başlığın ilk satırı zorunludur.")
        .max(180),

      titleSecond: z
        .string()
        .trim()
        .min(2, "Ana başlığın ikinci satırı zorunludur.")
        .max(180),

      description: z
        .string()
        .trim()
        .min(10, "Ana açıklama en az 10 karakter olmalıdır.")
        .max(1200),

      primaryButton: buttonSchema,
      secondaryButton: buttonSchema,
    }),

    featureCards: z
      .array(featureCardSchema)
      .min(
        1,
        "Ana sayfada en az bir özellik kartı bulunmalıdır."
      )
      .max(
        6,
        "Ana sayfaya en fazla 6 özellik kartı eklenebilir."
      ),

    manifesto: z.object({
      eyebrow: z
        .string()
        .trim()
        .max(100)
        .optional()
        .default(""),

      title: z
        .string()
        .trim()
        .min(2, "Manifesto başlığı zorunludur.")
        .max(240),

      description: z
        .string()
        .trim()
        .min(10, "Manifesto açıklaması en az 10 karakter olmalıdır.")
        .max(1500),

      primaryButton: buttonSchema,
      secondaryButton: buttonSchema,
    }),

    seo: z.object({
      title: z
        .string()
        .trim()
        .max(
          70,
          "SEO başlığı en fazla 70 karakter olabilir."
        )
        .optional()
        .default(""),

      description: z
        .string()
        .trim()
        .max(
          180,
          "SEO açıklaması en fazla 180 karakter olabilir."
        )
        .optional()
        .default(""),
    }),
  });