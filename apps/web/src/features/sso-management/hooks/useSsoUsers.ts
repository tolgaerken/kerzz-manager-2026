import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, type UsersListParams } from "../api/ssoApi";
import type { AddUserFormData } from "../types";

const QUERY_KEY = "sso-users";

export interface UseSsoUsersOptions {
  appId?: string;
  all?: boolean;
}

export function useSsoUsers(options?: UseSsoUsersOptions) {
  const params: UsersListParams | undefined = options
    ? {
        appId: options.appId,
        all: options.all
      }
    : undefined;

  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => usersApi.list(params),
    enabled: options?.appId !== "__disabled__"
  });
}

export function useSsoUser(id: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => usersApi.getById(id!),
    enabled: !!id
  });
}

export function useSearchUsers(query: string, limit = 20) {
  return useQuery({
    queryKey: [QUERY_KEY, "search", query, limit],
    queryFn: () => usersApi.search(query, limit),
    enabled: query.length >= 3
  });
}

export function useUserRoles(userId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEY, userId, "roles"],
    queryFn: () => usersApi.getRoles(userId!),
    enabled: !!userId
  });
}

export function useUpdateUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      usersApi.updateRoles(userId, roles),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId, "roles"] });
    }
  });
}

export function useAssignUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { userId: string; userName: string; roles?: string[] }) =>
      usersApi.assign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["sso-user-apps"] });
    }
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["sso-user-apps"] });
    }
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddUserFormData) => usersApi.addUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["sso-user-apps"] });
    }
  });
}
