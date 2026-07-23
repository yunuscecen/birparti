import { z } from "zod";

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended", "pending"], {
    message: "Geçerli bir kullanıcı durumu seçin.",
  }),
});

export const updateForumPermissionSchema = z.object({
  canCreateTopic: z.boolean({
    message: "Forum konu açma yetkisi boolean olmalıdır.",
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