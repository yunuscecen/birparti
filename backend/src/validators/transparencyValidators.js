import { z } from "zod";

const documentUrlSchema = z
  .string()
  .trim()
  .max(
    500,
    "Belge bağlantısı çok uzun."
  )
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
      message:
        "Geçerli bir belge bağlantısı girilmelidir.",
    }
  )
  .optional()
  .default("");

export const transparencyRecordSchema =
  z.object({
    type: z.enum(
      [
        "income",
        "expense",
      ],
      {
        message:
          "Kayıt türü gelir veya harcama olmalıdır.",
      }
    ),

    category: z
      .string()
      .trim()
      .min(
        2,
        "Kategori en az 2 karakter olmalıdır."
      )
      .max(
        100,
        "Kategori çok uzun."
      ),

    title: z
      .string()
      .trim()
      .min(
        3,
        "Başlık en az 3 karakter olmalıdır."
      )
      .max(
        180,
        "Başlık çok uzun."
      ),

    description: z
      .string()
      .trim()
      .max(
        2000,
        "Açıklama çok uzun."
      )
      .optional()
      .default(""),

    /*
     * Yönetici TL olarak giriş yapar.
     * Controller kuruşa dönüştürür.
     */
    amount: z.coerce
      .number()
      .positive(
        "Tutar sıfırdan büyük olmalıdır."
      )
      .max(
        1000000000000,
        "Tutar izin verilen sınırı aşıyor."
      ),

    transactionDate:
      z.coerce.date({
        message:
          "Geçerli bir işlem tarihi girilmelidir.",
      }),

    documentUrl:
      documentUrlSchema,

    status: z.enum([
      "draft",
      "published",
      "archived",
    ]),
  });