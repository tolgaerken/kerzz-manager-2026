import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appLicensesApi } from "../api/ssoApi";
import type { TAppLicense, AppLicenseFormData } from "../types";

const QUERY_KEY = "sso-app-licenses";

export function useAppLicenses() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => appLicensesApi.list()
  });
}

export function useAppLicensesByUser(userId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-user", userId],
    queryFn: () => appLicensesApi.getByUser(userId!),
    enabled: !!userId
  });
}

export function useAppLicensesByApp(appId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-app", appId],
    queryFn: () => appLicensesApi.getByApp(appId!),
    enabled: !!appId
  });
}

export function useAppLicense(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => appLicensesApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateAppLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AppLicenseFormData) => appLicensesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateAppLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<AppLicenseFormData & { is_active?: boolean }>;
    }) => appLicensesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeleteAppLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appLicensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateUserRolesInLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, userId, roles }: { appId: string; userId: string; roles: string[] }) =>
      appLicensesApi.updateUserRoles(appId, userId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}
