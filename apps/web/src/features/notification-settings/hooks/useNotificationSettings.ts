import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationSettingsApi } from "../api";
import type { UpdateNotificationSettingsDto } from "../types";

const QUERY_KEY = "notification-settings";

export function useNotificationSettings() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => notificationSettingsApi.get(),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateNotificationSettingsDto) =>
      notificationSettingsApi.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
