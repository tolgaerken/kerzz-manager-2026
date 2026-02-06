import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationTemplatesApi } from "../api";
import type {
  NotificationTemplateQueryParams,
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from "../types";

const QUERY_KEY = "notification-templates";

export function useNotificationTemplates(params?: NotificationTemplateQueryParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => notificationTemplatesApi.getAll(params),
  });
}

export function useNotificationTemplate(id: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => notificationTemplatesApi.getById(id),
    enabled: !!id,
  });
}

export function useNotificationTemplateByCode(code: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "code", code],
    queryFn: () => notificationTemplatesApi.getByCode(code),
    enabled: !!code,
  });
}

export function useTemplatePreview(code: string) {
  return useQuery({
    queryKey: [QUERY_KEY, "preview", code],
    queryFn: () => notificationTemplatesApi.preview(code),
    enabled: !!code,
  });
}

export function useCreateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateNotificationTemplateDto) =>
      notificationTemplatesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: UpdateNotificationTemplateDto;
    }) => notificationTemplatesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useDeleteNotificationTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useRenderTemplate() {
  return useMutation({
    mutationFn: ({
      code,
      data,
    }: {
      code: string;
      data?: Record<string, unknown>;
    }) => notificationTemplatesApi.render(code, data),
  });
}
