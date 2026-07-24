import { z } from "zod";

export const adminForumCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Kategori adı en az 2 karakter olmalıdır.")
    .max(100, "Kategori adı en fazla 100 karakter olabilir."),

  slug: z
    .string()
    .trim()
    .max(120, "Kategori adresi çok uzun.")
    .optional()
    .default(""),

  description: z
    .string()
    .trim()
    .max(700, "Kategori açıklaması çok uzun.")
    .optional()
    .default(""),

  color: z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "Geçerli bir HEX renk kodu girilmelidir."
    ),

  isActive: z.boolean(),

  sortOrder: z.coerce
    .number()
    .int()
    .min(0, "Sıralama değeri negatif olamaz."),
});

export const adminForumTopicModerationSchema = z.object({
  status: z.enum(
    ["open", "locked", "archived", "hidden"],
    {
      message: "Geçerli bir konu durumu seçilmelidir.",
    }
  ),

  isPinned: z.boolean(),
});

export const adminForumReplyModerationSchema = z.object({
  status: z.enum([
    "published",
    "hidden",
    "deleted",
  ]),
});