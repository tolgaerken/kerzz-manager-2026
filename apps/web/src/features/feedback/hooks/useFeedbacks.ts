import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFeedbacks,
  fetchFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  fetchFeedbackReplies,
  createReply,
} from "../api/feedbackApi";
import { FEEDBACK_CONSTANTS } from "../constants/feedback.constants";
import type {
  FeedbackQueryParams,
  CreateFeedbackInput,
  UpdateFeedbackInput,
  CreateReplyInput,
} from "../types/feedback.types";

const { QUERY_KEYS } = FEEDBACK_CONSTANTS;

export const feedbackKeys = {
  all: [QUERY_KEYS.FEEDBACKS] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  list: (params: FeedbackQueryParams) =>
    [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
  replies: () => [...feedbackKeys.all, "replies"] as const,
  repliesOf: (feedbackId: string) =>
    [...feedbackKeys.replies(), feedbackId] as const,
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

export function useFeedbackReplies(feedbackId: string) {
  return useQuery({
    queryKey: feedbackKeys.repliesOf(feedbackId),
    queryFn: () => fetchFeedbackReplies(feedbackId),
    enabled: !!feedbackId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReplyInput) => createReply(data),
    onSuccess: (_data, variables) => {
      // Yanıtlar listesini invalidate et
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.replies(),
      });
      // Root feedback listesini de invalidate et (replyCount güncellenmesi için)
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.lists(),
      });
      // Parent feedback detayını invalidate et
      if (variables.parentId) {
        queryClient.invalidateQueries({
          queryKey: feedbackKeys.detail(variables.parentId),
        });
      }
    },
  });
}
