import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rolesApi, type RolesListParams } from "../api/ssoApi";
import type { TRole, TRoleWithPermissions, RoleFormData } from "../types";

const QUERY_KEY = "sso-roles";

export interface UseRolesOptions {
  all?: boolean;
  appId?: string;
  includeInactive?: boolean;
}

export function useRoles(options?: UseRolesOptions) {
  const params: RolesListParams | undefined = options
    ? {
        all: options.all,
        appId: options.appId,
        includeInactive: options.includeInactive
      }
    : undefined;

  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => rolesApi.list(params),
    enabled: options?.appId !== "__disabled__"
  });
}

export function useRole(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => rolesApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoleFormData) => rolesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RoleFormData> }) =>
      rolesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useSetRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      rolesApi.setPermissions(roleId, permissions),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, roleId] });
      queryClient.invalidateQueries({ queryKey: ["sso-role-permissions"] });
    }
  });
}
