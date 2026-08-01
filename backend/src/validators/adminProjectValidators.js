import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Geçerli bir kayıt kimliği gönderilmelidir."
  );

const optionalUrlSchema = z
  .string()
  .trim()
  .max(1000, "Görsel adresi çok uzun.")
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    {
      message: "Geçerli bir görsel adresi girin.",
    }
  );

const optionalCloudinaryPublicIdSchema =
  z
    .string()
    .trim()
    .max(
      500,
      "Görsel kayıt kimliği çok uzun."
    )
    .refine(
      (value) => {
        return (
          !value ||
          value.startsWith(
            "birparti/"
          )
        );
      },
      {
        message:
          "Geçersiz Cloudinary görsel kimliği.",
      }
    )
    .optional()
    .default("");

export const adminProjectCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2, "Kategori adı en az 2 karakter olmalıdır.")
      .max(80, "Kategori adı en fazla 80 karakter olabilir."),

    slug: z
      .string()
      .trim()
      .max(100, "Kategori adresi çok uzun.")
      .optional()
      .default(""),

    description: z
      .string()
      .trim()
      .max(500, "Kategori açıklaması çok uzun.")
      .optional()
      .default(""),

    color: z
      .string()
      .trim()
      .regex(
        /^#[0-9a-fA-F]{6}$/,
        "Geçerli bir HEX renk kodu girin."
      ),

    isActive: z.boolean(),

    sortOrder: z.coerce
      .number()
      .int()
      .min(0, "Sıralama değeri negatif olamaz."),
  });

const projectSectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .max(180, "Bölüm başlığı çok uzun.")
    .optional()
    .default(""),

  body: z
    .string()
    .trim()
    .max(10000, "Bölüm içeriği çok uzun.")
    .optional()
    .default(""),
});

export const adminProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Proje başlığı en az 3 karakter olmalıdır.")
    .max(180, "Proje başlığı çok uzun."),

  slug: z
    .string()
    .trim()
    .max(200, "Proje adresi çok uzun.")
    .optional()
    .default(""),

  summary: z
    .string()
    .trim()
    .min(10, "Proje özeti en az 10 karakter olmalıdır.")
    .max(600, "Proje özeti en fazla 600 karakter olabilir."),

  category: objectIdSchema,

coverImage: z.object({
  url: optionalUrlSchema,

  publicId:
    optionalCloudinaryPublicIdSchema,

  alt: z
    .string()
    .trim()
    .max(
      180,
      "Görsel açıklaması çok uzun."
    )
    .optional()
    .default(""),
}),

  sections: z
    .array(projectSectionSchema)
    .max(20, "En fazla 20 içerik bölümü eklenebilir."),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(50)
    )
    .max(20, "En fazla 20 etiket eklenebilir."),

  status: z.enum([
    "draft",
    "published",
    "archived",
  ]),

  isFeatured: z.boolean(),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0),

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
      .max(
        180,
        "SEO açıklaması en fazla 180 karakter olabilir."
      )
      .optional()
      .default(""),
  }),
});