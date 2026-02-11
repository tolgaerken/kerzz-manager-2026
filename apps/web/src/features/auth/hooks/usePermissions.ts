import { useCallback } from "react";
import { useAuthStore } from "../store/authStore";

/**
 * Hook for permission checks
 * Provides utility functions to check user permissions
 */
export function usePermissions() {
  const { permissions, isAdmin, isFinance, isManager, activeLicance } = useAuthStore();

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // Admin has all permissions
      if (isAdmin) return true;
      return permissions.includes(permission);
    },
    [permissions, isAdmin]
  );

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback(
    (...requiredPermissions: string[]): boolean => {
      if (isAdmin) return true;
      return requiredPermissions.some((p) => permissions.includes(p));
    },
    [permissions, isAdmin]
  );

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback(
    (...requiredPermissions: string[]): boolean => {
      if (isAdmin) return true;
      return requiredPermissions.every((p) => permissions.includes(p));
    },
    [permissions, isAdmin]
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!activeLicance?.roles) return false;
      const roleNames = activeLicance.roles.map((r) => r.name.toLowerCase());
      return roleNames.includes(roleName.toLowerCase());
    },
    [activeLicance]
  );

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (...roleNames: string[]): boolean => {
      if (!activeLicance?.roles) return false;
      const userRoles = activeLicance.roles.map((r) => r.name.toLowerCase());
      return roleNames.some((role) => userRoles.includes(role.toLowerCase()));
    },
    [activeLicance]
  );

  /**
   * Get all user's permission names
   */
  const getAllPermissions = useCallback((): string[] => {
    return permissions;
  }, [permissions]);

  /**
   * Get all user's role names
   */
  const getAllRoles = useCallback((): string[] => {
    return activeLicance?.roles?.map((r) => r.name) ?? [];
  }, [activeLicance]);

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    // Role checks
    hasRole,
    hasAnyRole,
    // Role flags
    isAdmin,
    isFinance,
    isManager,
    // Getters
    getAllPermissions,
    getAllRoles,
    // Raw data
    permissions,
    roles: activeLicance?.roles ?? []
  };
}

export default usePermissions;
