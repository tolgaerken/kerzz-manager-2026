import { type ReactNode } from "react";
import { Navigate } from "@tanstack/react-router";
import { usePermissions } from "../hooks/usePermissions";

interface PermissionGuardProps {
  children: ReactNode;
  /**
   * Required permission(s) - user must have ALL of these
   */
  permissions?: string | string[];
  /**
   * Required permission(s) - user must have ANY of these
   */
  anyPermissions?: string[];
  /**
   * Required role(s) - user must have ANY of these
   */
  roles?: string[];
  /**
   * Redirect path when access is denied (default: /dashboard)
   */
  redirectTo?: string;
  /**
   * Custom fallback component when access is denied
   */
  fallback?: ReactNode;
}

/**
 * Guard component that checks permissions before rendering children
 *
 * @example
 * // Require single permission
 * <PermissionGuard permissions="userOperations">
 *   <UsersPage />
 * </PermissionGuard>
 *
 * @example
 * // Require all permissions
 * <PermissionGuard permissions={["userOperations", "financialOperations"]}>
 *   <AdminPage />
 * </PermissionGuard>
 *
 * @example
 * // Require any permission
 * <PermissionGuard anyPermissions={["userOperations", "contractOperations"]}>
 *   <ManagementPage />
 * </PermissionGuard>
 *
 * @example
 * // Require role
 * <PermissionGuard roles={["Veri Owner", "Yönetim"]}>
 *   <AdminPage />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permissions,
  anyPermissions,
  roles,
  redirectTo = "/dashboard",
  fallback
}: PermissionGuardProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission, hasAnyRole, isAdmin } =
    usePermissions();

  // Admin bypasses all permission checks
  if (isAdmin) {
    return <>{children}</>;
  }

  let hasAccess = true;

  // Check required permissions (ALL must match)
  if (permissions) {
    const permArray = Array.isArray(permissions) ? permissions : [permissions];
    hasAccess = hasAllPermissions(...permArray);
  }

  // Check any permissions (ANY must match)
  if (hasAccess && anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(...anyPermissions);
  }

  // Check roles (ANY must match)
  if (hasAccess && roles && roles.length > 0) {
    hasAccess = hasAnyRole(...roles);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}

export default PermissionGuard;
