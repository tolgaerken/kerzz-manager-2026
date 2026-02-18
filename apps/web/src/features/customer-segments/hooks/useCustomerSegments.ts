import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomerSegments,
  fetchCustomerSegmentsMinimal,
  fetchCustomerSegmentById,
  createCustomerSegment,
  updateCustomerSegment,
  deleteCustomerSegment
} from "../api/customerSegmentsApi";
import { CUSTOMER_SEGMENTS_CONSTANTS } from "../constants/customer-segments.constants";
import type {
  CustomerSegmentQueryParams,
  CreateCustomerSegmentInput,
  UpdateCustomerSegmentInput
} from "../types";

const { QUERY_KEYS } = CUSTOMER_SEGMENTS_CONSTANTS;

export function useCustomerSegments(params: CustomerSegmentQueryParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS, params],
    queryFn: () => fetchCustomerSegments(params),
    staleTime: 30 * 1000
  });
}

export function useCustomerSegmentsMinimal() {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS_MINIMAL],
    queryFn: () => fetchCustomerSegmentsMinimal(),
    staleTime: 60 * 1000
  });
}

export function useCustomerSegment(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER_SEGMENT, id],
    queryFn: () => fetchCustomerSegmentById(id!),
    enabled: !!id,
    staleTime: 30 * 1000
  });
}

export function useCreateCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerSegmentInput) =>
      createCustomerSegment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS_MINIMAL]
      });
    }
  });
}

export function useUpdateCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input
    }: {
      id: string;
      input: UpdateCustomerSegmentInput;
    }) => updateCustomerSegment(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS_MINIMAL]
      });
    }
  });
}

export function useDeleteCustomerSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomerSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.CUSTOMER_SEGMENTS_MINIMAL]
      });
    }
  });
}
