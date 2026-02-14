import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "../api/ssoApi";
import type { TApplication, ApplicationFormData } from "../types";

const QUERY_KEY = "sso-applications";

export function useApplications(includeInactive = false) {
  return useQuery({
    queryKey: [QUERY_KEY, { includeInactive }],
    queryFn: () => applicationsApi.list(includeInactive)
  });
}

export function useApplication(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => applicationsApi.getById(id!),
    enabled: !!id
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApplicationFormData) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}

export function useUpdateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ApplicationFormData> }) =>
      applicationsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    }
  });
}

export function useDeleteApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => applicationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    }
  });
}
