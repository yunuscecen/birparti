import { z } from "zod";

export const contactRequestSchema =
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
        "Ad soyad çok uzun."
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
      ),

    phone: z
      .string()
      .trim()
      .max(
        30,
        "Telefon numarası çok uzun."
      )
      .refine(
        (value) =>
          !value ||
          /^[0-9+\s()-]+$/.test(
            value
          ),
        {
          message:
            "Geçerli bir telefon numarası girin.",
        }
      ),

    type: z.enum(
      [
        "suggestion",
        "opinion",
        "complaint",
        "technical",
        "other",
      ],
      {
        message:
          "Bir talep türü seçin.",
      }
    ),

    subject: z
      .string()
      .trim()
      .min(
        5,
        "Talep konusu en az 5 karakter olmalıdır."
      )
      .max(
        160,
        "Talep konusu çok uzun."
      ),

    message: z
      .string()
      .trim()
      .min(
        20,
        "Mesajınız en az 20 karakter olmalıdır."
      )
      .max(
        5000,
        "Mesajınız en fazla 5000 karakter olabilir."
      ),

    privacyAccepted: z
      .boolean()
      .refine(
        (value) => value,
        {
          message:
            "Gizlilik ve kişisel veri bilgilendirmesini kabul etmelisiniz.",
        }
      ),

    website: z
      .string()
      .optional()
      .default(""),
  });