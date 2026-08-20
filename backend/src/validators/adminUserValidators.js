import { z } from "zod";

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "pending"], {
    message: "Geçerli bir kullanıcı durumu seçin.",
  }),
});



export const updateUserRoleSchema = z.object({
  role: z.enum(
    [
      "member",
      "moderator",
      "contentEditor",
      "financeManager",
      "admin",
      "superAdmin",
    ],
    {
      message: "Geçerli bir kullanıcı rolü seçin.",
    }
  ),
});

export const updateUserExpertProfileSchema =
  z
    .object({
      isVerified: z.boolean(),

      title: z
        .string()
        .trim()
        .max(
          120,
          "Uzman unvanı en fazla 120 karakter olabilir."
        )
        .optional()
        .default(""),

      area: z
        .string()
        .trim()
        .max(
          180,
          "Uzmanlık alanı en fazla 180 karakter olabilir."
        )
        .optional()
        .default(""),

      bio: z
        .string()
        .trim()
        .max(
          600,
          "Uzman açıklaması en fazla 600 karakter olabilir."
        )
        .optional()
        .default(""),
    })
    .superRefine(
      (data, context) => {
        if (
          data.isVerified &&
          data.title.length < 2
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,
            path: ["title"],
            message:
              "Doğrulanmış uzman için unvan zorunludur.",
          });
        }

        if (
          data.isVerified &&
          data.area.length < 2
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,
            path: ["area"],
            message:
              "Doğrulanmış uzman için uzmanlık alanı zorunludur.",
          });
        }
      }
    );