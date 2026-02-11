import { type ReactNode } from "react";
import { usePermissions } from "../hooks/usePermissions";

interface WithPermissionProps {
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
   * Fallback content when permission is denied (default: null)
   */
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on permissions
 * Unlike PermissionGuard, this doesn't redirect - it just hides content
 *
 * @example
 * // Show button only if user has permission
 * <WithPermission permissions="userOperations">
 *   <Button>Kullanıcı Ekle</Button>
 * </WithPermission>
 *
 * @example
 * // Show with fallback
 * <WithPermission permissions="financialOperations" fallback={<DisabledButton />}>
 *   <Button>Ödeme Yap</Button>
 * </WithPermission>
 *
 * @example
 * // Check any permission
 * <WithPermission anyPermissions={["userOperations", "contractOperations"]}>
 *   <AdminMenu />
 * </WithPermission>
 */
export function WithPermission({
  children,
  permissions,
  anyPermissions,
  roles,
  fallback = null
}: WithPermissionProps) {
  const { hasAllPermissions, hasAnyPermission, hasAnyRole, isAdmin } = usePermissions();

  // Admin has access to everything
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
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-Order Component version of WithPermission
 *
 * @example
 * const ProtectedComponent = withPermission(MyComponent, {
 *   permissions: "userOperations"
 * });
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<WithPermissionProps, "children">
) {
  return function PermissionWrappedComponent(props: P) {
    return (
      <WithPermission {...options}>
        <WrappedComponent {...props} />
      </WithPermission>
    );
  };
}

export default WithPermission;
