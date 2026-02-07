import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEDocMembers,
  createEDocMember,
  updateEDocMember,
  deleteEDocMember,
} from "../api/eDocMembersApi";
import type {
  EDocMemberQueryParams,
  EDocMembersResponse,
  EDocMemberFormData,
} from "../types/eDocMember.types";

export const eDocMemberKeys = {
  all: ["e-doc-members"] as const,
  lists: () => [...eDocMemberKeys.all, "list"] as const,
  list: (params: EDocMemberQueryParams) =>
    [...eDocMemberKeys.lists(), params] as const,
};

export function useEDocMembers(params: EDocMemberQueryParams = {}) {
  return useQuery<EDocMembersResponse, Error>({
    queryKey: eDocMemberKeys.list(params),
    queryFn: () => fetchEDocMembers(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useCreateEDocMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EDocMemberFormData) => createEDocMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocMemberKeys.lists() });
    },
  });
}

export function useUpdateEDocMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<EDocMemberFormData>;
    }) => updateEDocMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocMemberKeys.lists() });
    },
  });
}

export function useDeleteEDocMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEDocMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eDocMemberKeys.lists() });
    },
  });
}
