import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(
    /^[a-f\d]{24}$/i,
    "Geçerli bir kategori seçilmelidir."
  );

export const createForumTopicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(
      5,
      "Konu başlığı en az 5 karakter olmalıdır."
    )
    .max(
      220,
      "Konu başlığı en fazla 220 karakter olabilir."
    ),

  body: z
    .string()
    .trim()
    .min(
      20,
      "Konu içeriği en az 20 karakter olmalıdır."
    )
    .max(
      30000,
      "Konu içeriği çok uzun."
    ),

  category: objectIdSchema,
});

export const createForumReplySchema = z.object({
  body: z
    .string()
    .trim()
    .min(
      2,
      "Yanıt en az 2 karakter olmalıdır."
    )
    .max(
      15000,
      "Yanıt içeriği çok uzun."
    ),

  replyToReplyId: z
    .string()
    .trim()
    .regex(
      /^[a-f\d]{24}$/i,
      "Yanıt verilen kayıt geçerli değil."
    )
    .nullable()
    .optional()
    .default(null),
});