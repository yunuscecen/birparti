import { z } from "zod";

const objectIdPattern =
  /^[a-f\d]{24}$/i;

export const updateMyForumTopicSchema =
  z.object({
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
        "Konu içeriği en fazla 30000 karakter olabilir."
      ),

    category: z
      .string()
      .trim()
      .regex(
        objectIdPattern,
        "Geçerli bir forum kategorisi seçmelisiniz."
      ),
  });

export const updateMyForumReplySchema =
  z.object({
    body: z
      .string()
      .trim()
      .min(
        2,
        "Yanıt en az 2 karakter olmalıdır."
      )
      .max(
        15000,
        "Yanıt en fazla 15000 karakter olabilir."
      ),
  });