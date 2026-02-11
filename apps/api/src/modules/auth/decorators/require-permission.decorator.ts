import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";

/**
 * Decorator to require specific permissions for a route
 * Usage: @RequirePermission('userOperations', 'financialOperations')
 */
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Decorator to require any of the specified permissions
 * Usage: @RequireAnyPermission('userOperations', 'financialOperations')
 */
export const PERMISSIONS_ANY_KEY = "permissionsAny";
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, permissions);
