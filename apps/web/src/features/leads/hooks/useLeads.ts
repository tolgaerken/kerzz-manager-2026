import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLeads,
  fetchLeadById,
  createLead,
  updateLead,
  deleteLead,
  addLeadActivity,
  fetchLeadStats,
} from "../api/leadsApi";
import { LEADS_CONSTANTS } from "../constants/leads.constants";
import type {
  LeadQueryParams,
  CreateLeadInput,
  UpdateLeadInput,
  AddActivityInput,
} from "../types/lead.types";

const { QUERY_KEYS } = LEADS_CONSTANTS;

export const leadKeys = {
  all: [QUERY_KEYS.LEADS] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (params: LeadQueryParams) => [...leadKeys.lists(), params] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  stats: () => [QUERY_KEYS.LEAD_STATS] as const,
};

export function useLeads(params: LeadQueryParams = {}) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => fetchLeads(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadKeys.detail(id),
    queryFn: () => fetchLeadById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: leadKeys.stats(),
    queryFn: () => fetchLeadStats(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeadInput) => createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.stats(),
      });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadInput }) =>
      updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.details(),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.stats(),
      });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.stats(),
      });
    },
  });
}

export function useAddLeadActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddActivityInput }) =>
      addLeadActivity(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: leadKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: leadKeys.lists(),
      });
    },
  });
}
