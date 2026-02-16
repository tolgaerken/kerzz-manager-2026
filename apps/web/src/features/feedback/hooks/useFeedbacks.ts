import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeedbacks,
  fetchFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} from "../api/feedbackApi";
import { FEEDBACK_CONSTANTS } from "../constants/feedback.constants";
import type {
  FeedbackQueryParams,
  CreateFeedbackInput,
  UpdateFeedbackInput,
} from "../types/feedback.types";

const { QUERY_KEYS } = FEEDBACK_CONSTANTS;

export const feedbackKeys = {
  all: [QUERY_KEYS.FEEDBACKS] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  list: (params: FeedbackQueryParams) =>
    [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
};

export function useFeedbacks(params: FeedbackQueryParams = {}) {
  return useQuery({
    queryKey: feedbackKeys.list(params),
    queryFn: () => fetchFeedbacks(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useFeedback(id: string) {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => fetchFeedbackById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackInput) => createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(),
      });
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeedbackInput }) =>
      updateFeedback(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.details(),
      });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(),
      });
    },
  });
}
