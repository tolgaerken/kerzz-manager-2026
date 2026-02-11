import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../api/usersApi";
import type { AssignUserRequest } from "../types/user.types";

// Query keys
export const usersQueryKeys = {
  all: ["users"] as const,
  appUsers: () => [...usersQueryKeys.all, "app-users"] as const,
  search: (query: string) => [...usersQueryKeys.all, "search", query] as const,
  user: (userId: string) => [...usersQueryKeys.all, "user", userId] as const,
  userRoles: (userId: string) => [...usersQueryKeys.all, "user-roles", userId] as const,
  roles: () => [...usersQueryKeys.all, "roles"] as const,
  role: (roleId: string) => [...usersQueryKeys.all, "role", roleId] as const,
  permissions: () => [...usersQueryKeys.all, "permissions"] as const,
  permissionsGrouped: () => [...usersQueryKeys.all, "permissions-grouped"] as const
};

// ==================== USER HOOKS ====================

/**
 * Fetch all users assigned to this application
 */
export function useAppUsers() {
  return useQuery({
    queryKey: usersQueryKeys.appUsers(),
    queryFn: usersApi.fetchAppUsers
  });
}

/**
 * Search users in SSO database
 */
export function useSearchUsers(query: string, enabled = true, minQueryLength = 2) {
  return useQuery({
    queryKey: usersQueryKeys.search(query),
    queryFn: () => usersApi.searchUsers(query),
    enabled: enabled && query.length >= minQueryLength
  });
}

/**
 * Fetch a single user by ID
 */
export function useUser(userId: string) {
  return useQuery({
    queryKey: usersQueryKeys.user(userId),
    queryFn: () => usersApi.fetchUserById(userId),
    enabled: !!userId
  });
}

/**
 * Fetch user's roles
 */
export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: usersQueryKeys.userRoles(userId),
    queryFn: () => usersApi.fetchUserRoles(userId),
    enabled: !!userId
  });
}

/**
 * Assign user to application
 */
export function useAssignUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignUserRequest) => usersApi.assignUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.appUsers() });
    }
  });
}

/**
 * Remove user from application
 */
export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.removeUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.appUsers() });
    }
  });
}

/**
 * Update user's roles
 */
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      usersApi.updateUserRoles(userId, roles),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.userRoles(userId) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.appUsers() });
    }
  });
}

// ==================== ROLE HOOKS ====================

/**
 * Fetch all roles
 */
export function useRoles() {
  return useQuery({
    queryKey: usersQueryKeys.roles(),
    queryFn: usersApi.fetchRoles
  });
}

/**
 * Fetch a single role with permissions
 */
export function useRole(roleId: string) {
  return useQuery({
    queryKey: usersQueryKeys.role(roleId),
    queryFn: () => usersApi.fetchRoleById(roleId),
    enabled: !!roleId
  });
}

/**
 * Create a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; developer?: boolean }) =>
      usersApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles() });
    }
  });
}

/**
 * Update a role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data
    }: {
      roleId: string;
      data: { name?: string; description?: string; developer?: boolean; isActive?: boolean };
    }) => usersApi.updateRole(roleId, data),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.role(roleId) });
    }
  });
}

/**
 * Delete a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => usersApi.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.roles() });
    }
  });
}

/**
 * Set role permissions
 */
export function useSetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      usersApi.setRolePermissions(roleId, permissions),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.role(roleId) });
    }
  });
}

// ==================== PERMISSION HOOKS ====================

/**
 * Fetch all permissions
 */
export function usePermissions() {
  return useQuery({
    queryKey: usersQueryKeys.permissions(),
    queryFn: usersApi.fetchPermissions
  });
}

/**
 * Fetch permissions grouped
 */
export function usePermissionsGrouped() {
  return useQuery({
    queryKey: usersQueryKeys.permissionsGrouped(),
    queryFn: usersApi.fetchPermissionsGrouped
  });
}

/**
 * Create a new permission
 */
export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { group: string; permission: string; description?: string }) =>
      usersApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.permissions() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.permissionsGrouped() });
    }
  });
}

/**
 * Delete a permission
 */
export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionId: string) => usersApi.deletePermission(permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.permissions() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.permissionsGrouped() });
    }
  });
}
