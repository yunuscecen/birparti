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