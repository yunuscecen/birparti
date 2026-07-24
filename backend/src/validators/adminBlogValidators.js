import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Geçerli bir kayıt kimliği gönderilmelidir."
  );

const optionalImageUrlSchema = z
  .string()
  .trim()
  .max(1000, "Görsel adresi çok uzun.")
  .refine(
    (value) => {
      if (!value) {
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
        "Geçerli bir görsel adresi girin.",
    }
  );

export const adminBlogCategorySchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        "Kategori adı en az 2 karakter olmalıdır."
      )
      .max(
        80,
        "Kategori adı en fazla 80 karakter olabilir."
      ),

    slug: z
      .string()
      .trim()
      .max(
        100,
        "Kategori adresi çok uzun."
      )
      .optional()
      .default(""),

    description: z
      .string()
      .trim()
      .max(
        600,
        "Kategori açıklaması çok uzun."
      )
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
      .min(
        0,
        "Sıralama değeri negatif olamaz."
      ),
  });

const blogSectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .max(
      200,
      "Bölüm başlığı çok uzun."
    )
    .optional()
    .default(""),

  body: z
    .string()
    .trim()
    .min(
      1,
      "Blog içerik alanı boş olamaz."
    )
    .max(
      20000,
      "Blog içerik alanı çok uzun."
    ),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),
});

export const adminBlogPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      3,
      "Blog başlığı en az 3 karakter olmalıdır."
    )
    .max(
      200,
      "Blog başlığı en fazla 200 karakter olabilir."
    ),

  slug: z
    .string()
    .trim()
    .max(
      220,
      "Blog sayfa adresi çok uzun."
    )
    .optional()
    .default(""),

  excerpt: z
    .string()
    .trim()
    .min(
      10,
      "Blog özeti en az 10 karakter olmalıdır."
    )
    .max(
      700,
      "Blog özeti en fazla 700 karakter olabilir."
    ),

  category: objectIdSchema,

  coverImage: z.object({
    url: optionalImageUrlSchema,

    alt: z
      .string()
      .trim()
      .max(
        200,
        "Görsel açıklaması çok uzun."
      )
      .optional()
      .default(""),
  }),

  sections: z
    .array(blogSectionSchema)
    .min(
      1,
      "En az bir blog içerik alanı bulunmalıdır."
    )
    .max(
      30,
      "En fazla 30 içerik bölümü eklenebilir."
    ),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(
          1,
          "Boş etiket gönderilemez."
        )
        .max(
          50,
          "Bir etiket en fazla 50 karakter olabilir."
        )
    )
    .max(
      25,
      "En fazla 25 etiket eklenebilir."
    ),

  status: z.enum([
    "draft",
    "published",
    "archived",
  ]),

  isFeatured: z.boolean(),

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