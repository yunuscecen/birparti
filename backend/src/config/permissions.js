export const systemPermissions = [
  "forum:create-topic",
  "forum:comment",
  "forum:moderate",
  "content:manage",
  "projects:manage",
  "blog:manage",
  "donations:view",
  "donations:manage",
  "users:manage",
];

export const superAdminPermissions = [...systemPermissions];

export const forumTopicPermission = "forum:create-topic";