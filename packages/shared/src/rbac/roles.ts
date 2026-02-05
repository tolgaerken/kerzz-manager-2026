export const RBAC_ROLES = ["admin", "manager", "user"] as const;

export type RbacRole = (typeof RBAC_ROLES)[number];
