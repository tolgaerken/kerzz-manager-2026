import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomers,
  fetchCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../api/customersApi";
import { CUSTOMERS_CONSTANTS } from "../constants/customers.constants";
import type {
  CustomerQueryParams,
  CreateCustomerInput,
  UpdateCustomerInput
} from "../types";

const { QUERY_KEYS } = CUSTOMERS_CONSTANTS;

export function useCustomers(params: CustomerQueryParams = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, params],
    queryFn: () => fetchCustomers(params),
    staleTime: 30 * 1000 // 30 seconds
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER, id],
    queryFn: () => fetchCustomerById(id!),
    enabled: !!id,
    staleTime: 30 * 1000
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCustomerInput) => createCustomer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    }
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerInput }) =>
      updateCustomer(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    }
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
    }
  });
}
