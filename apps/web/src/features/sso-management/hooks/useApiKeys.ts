import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi } from "../api/ssoApi";
import type { TApiKey, ApiKeyFormData } from "../types";

const QUERY_KEY = "sso-api-keys";

export function useApiKeys() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => apiKeysApi.list()
  });
}

export function useApiKeysByApp(appId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, "by-app", appId],
    queryFn: () => apiKeysApi.getByApp(appId!),
    enabled: !!appId
  });
}

export function useApiKey(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => apiKeysApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApiKeyFormData) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApiKeyFormData & { isActive?: boolean }> }) =>
      apiKeysApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.regenerate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}
