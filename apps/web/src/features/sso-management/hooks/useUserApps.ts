import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userAppsApi } from "../api/ssoApi";
import type { TUserApp, UserAppFormData } from "../types";

const QUERY_KEY = "sso-user-apps";

export function useUserApps() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => userAppsApi.list()
  });
}

export function useUserAppsByUser(userId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-user", userId],
    queryFn: () => userAppsApi.getByUser(userId!),
    enabled: !!userId
  });
}

export function useUserAppsByApp(appId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-app", appId],
    queryFn: () => userAppsApi.getByApp(appId!),
    enabled: !!appId
  });
}

export function useUserApp(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => userAppsApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateUserApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserAppFormData) => userAppsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateUserApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<UserAppFormData & { isActive?: boolean }>;
    }) => userAppsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeleteUserApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userAppsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}
