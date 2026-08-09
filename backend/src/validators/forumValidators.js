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

export const createForumReportSchema = z.object({
  targetType: z.enum(["topic", "reply"], {
    message: "Geçerli bir içerik türü seçilmelidir.",
  }),

  targetId: z
    .string()
    .trim()
    .regex(
      /^[a-f\d]{24}$/i,
      "Bildirilen içerik kimliği geçerli değil."
    ),

  reason: z.enum(
    [
      "spam",
      "harassment",
      "hate",
      "misinformation",
      "personal_data",
      "other",
    ],
    {
      message: "Geçerli bir bildirim nedeni seçilmelidir.",
    }
  ),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Bildirim açıklaması en fazla 1000 karakter olabilir."
    )
    .optional()
    .default(""),
});

export const updateForumTopicVoteSchema =
  z.object({
    vote: z
      .number()
      .int()
      .refine(
        (value) =>
          [-1, 0, 1].includes(
            value
          ),
        {
          message:
            "Oy değeri -1, 0 veya 1 olmalıdır.",
        }
      ),
  });

export const updateForumTopicSupportSchema =
  z.object({
    isSupported: z.boolean({
      message:
        "Destek durumu boolean olmalıdır.",
    }),
  });

export const updateForumTopicSolvedSchema =
  z.object({
    isSolved: z.boolean({
      message:
        "Çözüm durumu boolean olmalıdır.",
    }),
  });