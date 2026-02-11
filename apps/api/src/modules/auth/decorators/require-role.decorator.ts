import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

/**
 * Decorator to require specific roles for a route
 * Usage: @RequireRole('Veri Owner', 'Yönetim')
 */
export const RequireRole = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
