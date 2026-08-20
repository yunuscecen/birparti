import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Geçerli bir e-posta adresi girin.")
  .max(160, "E-posta adresi çok uzun.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır.")
  .max(72, "Şifre en fazla 72 karakter olabilir.")
  .regex(/[a-zçğıöşü]/, "Şifre en az bir küçük harf içermelidir.")
  .regex(/[A-ZÇĞİÖŞÜ]/, "Şifre en az bir büyük harf içermelidir.")
  .regex(/[0-9]/, "Şifre en az bir rakam içermelidir.");

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ad en az 2 karakter olmalıdır.")
      .max(50, "Ad en fazla 50 karakter olabilir."),

    lastName: z
      .string()
      .trim()
      .min(2, "Soyad en az 2 karakter olmalıdır.")
      .max(50, "Soyad en fazla 50 karakter olabilir."),

    email: emailSchema,

    password: passwordSchema,

    passwordConfirm: z.string(),

    acceptedTerms: z
      .boolean()
      .refine((value) => value === true, {
        message: "Üyelik koşullarını kabul etmelisiniz.",
      }),

    acceptedPrivacy: z
      .boolean()
      .refine((value) => value === true, {
        message: "Gizlilik metnini kabul etmelisiniz.",
      }),

    acceptedMarketing: z.boolean().optional().default(false),
  })
  .refine(
    (data) => data.password === data.passwordConfirm,
    {
      path: ["passwordConfirm"],
      message: "Şifreler birbiriyle eşleşmiyor.",
    }
  );

export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Şifre zorunludur.")
    .max(72, "Şifre geçersiz."),
});

export const forgotPasswordSchema =
  z.object({
    email: emailSchema,
  });

export const resetPasswordSchema =
  z
    .object({
      password:
        passwordSchema,

      passwordConfirm:
        z.string(),
    })
    .refine(
      (data) =>
        data.password ===
        data.passwordConfirm,
      {
        path: [
          "passwordConfirm",
        ],

        message:
          "Şifreler birbiriyle eşleşmiyor.",
      }
    );


    export const updateProfileSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "Ad en az 2 karakter olmalıdır."
      )
      .max(
        50,
        "Ad en fazla 50 karakter olabilir."
      ),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        "Soyad en az 2 karakter olmalıdır."
      )
      .max(
        50,
        "Soyad en fazla 50 karakter olabilir."
      ),
  });

export const updateMarketingPreferenceSchema =
  z.object({
    acceptedMarketing:
      z.boolean({
        message:
          "E-posta tercihi geçerli değil.",
      }),
  });

export const changePasswordSchema =
  z
    .object({
      currentPassword: z
        .string()
        .min(
          1,
          "Mevcut şifrenizi girin."
        )
        .max(
          72,
          "Mevcut şifre geçersiz."
        ),

      password:
        passwordSchema,

      passwordConfirm:
        z.string(),
    })
    .refine(
      (data) =>
        data.password ===
        data.passwordConfirm,
      {
        path: [
          "passwordConfirm",
        ],

        message:
          "Yeni şifreler birbiriyle eşleşmiyor.",
      }
    );