import { z } from "zod";

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta adresi girin."),

  password: z
    .string()
    .min(1, "Şifrenizi girin."),
});

export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ad en az 2 karakter olmalıdır."),

    lastName: z
      .string()
      .trim()
      .min(2, "Soyad en az 2 karakter olmalıdır."),

    email: z
      .string()
      .trim()
      .email("Geçerli bir e-posta adresi girin."),

    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır.")
      .max(72, "Şifre en fazla 72 karakter olabilir.")
      .regex(
        /[a-zçğıöşü]/,
        "Şifre en az bir küçük harf içermelidir."
      )
      .regex(
        /[A-ZÇĞİÖŞÜ]/,
        "Şifre en az bir büyük harf içermelidir."
      )
      .regex(
        /[0-9]/,
        "Şifre en az bir rakam içermelidir."
      ),

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

    acceptedMarketing: z.boolean().default(false),
  })
  .refine(
    (data) => data.password === data.passwordConfirm,
    {
      path: ["passwordConfirm"],
      message: "Şifreler birbiriyle eşleşmiyor.",
    }
  );

  export const forgotPasswordFormSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email(
        "Geçerli bir e-posta adresi girin."
      ),
  });

const resetPasswordSchema = z
  .string()
  .min(
    8,
    "Şifre en az 8 karakter olmalıdır."
  )
  .max(
    72,
    "Şifre en fazla 72 karakter olabilir."
  )
  .regex(
    /[a-zçğıöşü]/,
    "Şifre en az bir küçük harf içermelidir."
  )
  .regex(
    /[A-ZÇĞİÖŞÜ]/,
    "Şifre en az bir büyük harf içermelidir."
  )
  .regex(
    /[0-9]/,
    "Şifre en az bir rakam içermelidir."
  );

export const resetPasswordFormSchema =
  z
    .object({
      password:
        resetPasswordSchema,

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