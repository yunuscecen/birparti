import { z } from "zod";

const relativeOrAbsoluteUrlSchema = z
  .string()
  .trim()
  .max(300, "Bağlantı adresi en fazla 300 karakter olabilir.")
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      if (value.startsWith("/")) {
        return true;
      }

      try {
        const parsedUrl = new URL(value);

        return ["http:", "https:"].includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    },
    {
      message:
        "Bağlantı /iletisim gibi site içi veya geçerli bir internet adresi olmalıdır.",
    }
  );

const adminPageCardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Kart başlığı en az 2 karakter olmalıdır.")
    .max(160, "Kart başlığı en fazla 160 karakter olabilir."),

  description: z
    .string()
    .trim()
    .max(1200, "Kart açıklaması en fazla 1200 karakter olabilir.")
    .optional()
    .default(""),

  linkLabel: z
    .string()
    .trim()
    .max(60, "Bağlantı yazısı en fazla 60 karakter olabilir.")
    .optional()
    .default(""),

  linkUrl: relativeOrAbsoluteUrlSchema.optional().default(""),

  sortOrder: z.coerce.number().int().min(0).default(0),
});

const adminPageSectionSchema = z
  .object({
    type: z.enum(["text", "cards"], {
      message: "Geçerli bir bölüm türü seçilmelidir.",
    }),

    title: z
      .string()
      .trim()
      .max(180, "Bölüm başlığı en fazla 180 karakter olabilir.")
      .optional()
      .default(""),

    paragraphs: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Boş paragraf gönderilemez.")
          .max(5000, "Bir paragraf en fazla 5000 karakter olabilir.")
      )
      .max(30, "Bir bölüme en fazla 30 paragraf eklenebilir.")
      .default([]),

    cards: z
      .array(adminPageCardSchema)
      .max(30, "Bir bölüme en fazla 30 kart eklenebilir.")
      .default([]),

    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((section, context) => {
    if (
      section.type === "text" &&
      section.paragraphs.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["paragraphs"],
        message:
          "Metin bölümünde en az bir paragraf bulunmalıdır.",
      });
    }

    if (
      section.type === "cards" &&
      section.cards.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cards"],
        message:
          "Kart bölümünde en az bir kart bulunmalıdır.",
      });
    }
  });

export const updateAdminPageSchema = z.object({
  eyebrow: z
    .string()
    .trim()
    .max(100, "Üst başlık en fazla 100 karakter olabilir.")
    .optional()
    .default(""),

  title: z
    .string()
    .trim()
    .min(2, "Sayfa başlığı en az 2 karakter olmalıdır.")
    .max(180, "Sayfa başlığı en fazla 180 karakter olabilir."),

  description: z
    .string()
    .trim()
    .max(1200, "Sayfa açıklaması en fazla 1200 karakter olabilir.")
    .optional()
    .default(""),

  sections: z
    .array(adminPageSectionSchema)
    .max(20, "Bir sayfaya en fazla 20 bölüm eklenebilir.")
    .default([]),

  status: z.enum(["draft", "published", "archived"], {
    message: "Geçerli bir yayın durumu seçilmelidir.",
  }),

  seo: z.object({
    title: z
      .string()
      .trim()
      .max(70, "SEO başlığı en fazla 70 karakter olabilir.")
      .optional()
      .default(""),

    description: z
      .string()
      .trim()
      .max(180, "SEO açıklaması en fazla 180 karakter olabilir.")
      .optional()
      .default(""),
  }),
});