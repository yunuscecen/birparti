import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .max(
    30,
    "Telefon numarası çok uzun."
  )
  .refine(
    (value) => {
      if (!value) {
        return true;
      }

      return /^[0-9+\s()-]+$/.test(
        value
      );
    },
    {
      message:
        "Geçerli bir telefon numarası girin.",
    }
  )
  .optional()
  .default("");

export const publicContactRequestSchema =
  z.object({
    fullName: z
      .string()
      .trim()
      .min(
        2,
        "Ad soyad en az 2 karakter olmalıdır."
      )
      .max(
        120,
        "Ad soyad en fazla 120 karakter olabilir."
      ),

    email: z
      .string()
      .trim()
      .email(
        "Geçerli bir e-posta adresi girin."
      )
      .max(
        254,
        "E-posta adresi çok uzun."
      )
      .transform((value) =>
        value.toLowerCase()
      ),

    phone: phoneSchema,

    type: z.enum([
      "suggestion",
      "opinion",
      "complaint",
      "technical",
      "other",
    ]),

    subject: z
      .string()
      .trim()
      .min(
        5,
        "Talep konusu en az 5 karakter olmalıdır."
      )
      .max(
        160,
        "Talep konusu en fazla 160 karakter olabilir."
      ),

    message: z
      .string()
      .trim()
      .min(
        20,
        "Talep mesajı en az 20 karakter olmalıdır."
      )
      .max(
        5000,
        "Talep mesajı en fazla 5000 karakter olabilir."
      ),

    privacyAccepted: z
      .boolean()
      .refine(
        (value) => value === true,
        {
          message:
            "Gizlilik ve kişisel veri bilgilendirmesini kabul etmelisiniz.",
        }
      ),

    /*
     * Gerçek kullanıcılar bu alanı
     * görmeyecek. Bot kontrolü için
     * gizli form alanı olarak kullanılacak.
     */
    website: z
      .string()
      .trim()
      .max(200)
      .optional()
      .default(""),
  });

export const adminContactRequestUpdateSchema =
  z
    .object({
      status: z
        .enum([
          "new",
          "inReview",
          "answered",
          "closed",
          "spam",
        ])
        .optional(),

      priority: z
        .enum([
          "low",
          "normal",
          "high",
          "urgent",
        ])
        .optional(),

      adminNote: z
        .string()
        .trim()
        .max(
          5000,
          "Yönetici notu çok uzun."
        )
        .optional(),
        publicResponse: z
  .string()
  .trim()
  .max(
    5000,
    "Kullanıcıya gönderilecek yanıt çok uzun."
  )
  .optional(),

      isArchived:
        z.boolean().optional(),
    })
    .refine(
      (data) =>
        Object.values(data).some(
          (value) =>
            value !== undefined
        ),
      {
        message:
          "Güncellenecek en az bir alan gönderilmelidir.",
      }
    );