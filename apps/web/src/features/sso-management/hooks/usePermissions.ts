import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionsApi, type PermissionsListParams } from "../api/ssoApi";
import type { TPermission, PermissionFormData } from "../types";

const QUERY_KEY = "sso-permissions";

export interface UsePermissionsOptions {
  all?: boolean;
  appId?: string;
  includeInactive?: boolean;
}

export function usePermissions(options?: UsePermissionsOptions) {
  const params: PermissionsListParams | undefined = options
    ? {
        all: options.all,
        appId: options.appId,
        includeInactive: options.includeInactive
      }
    : undefined;

  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => permissionsApi.list(params),
    enabled: options?.appId !== "__disabled__"
  });
}

export function usePermission(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => permissionsApi.getById(id!),
    enabled: !!id
  });
}

export function usePermissionsGrouped(all = false, includeInactive = false) {
  return useQuery({
    queryKey: [QUERY_KEY, "grouped", { all, includeInactive }],
    queryFn: () => permissionsApi.getGrouped(all, includeInactive)
  });
}

export function usePermissionGroups(all = false, includeInactive = false) {
  return useQuery({
    queryKey: [QUERY_KEY, "groups", { all, includeInactive }],
    queryFn: () => permissionsApi.getGroups(all, includeInactive)
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PermissionFormData) => permissionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PermissionFormData> }) =>
      permissionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permissionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}
