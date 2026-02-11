export const USERS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",

  ENDPOINTS: {
    // Users
    APP_USERS: "/sso/users",
    SEARCH_USERS: "/sso/users/search",
    USER_BY_ID: (userId: string) => `/sso/users/${userId}`,
    ASSIGN_USER: "/sso/users/assign",
    REMOVE_USER: (userId: string) => `/sso/users/${userId}`,
    USER_ROLES: (userId: string) => `/sso/users/${userId}/roles`,

    // Roles
    ROLES: "/sso/roles",
    ROLE_BY_ID: (roleId: string) => `/sso/roles/${roleId}`,
    ROLE_PERMISSIONS: (roleId: string) => `/sso/roles/${roleId}/permissions`,

    // Permissions
    PERMISSIONS: "/sso/permissions",
    PERMISSIONS_GROUPED: "/sso/permissions/grouped",
    PERMISSION_GROUPS: "/sso/permissions/groups",
    PERMISSION_BY_ID: (permissionId: string) => `/sso/permissions/${permissionId}`
  }
} as const;
