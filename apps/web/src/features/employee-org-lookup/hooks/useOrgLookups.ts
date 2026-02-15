import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orgDepartmentApi, orgTitleApi, orgLocationApi } from "../api";
import type {
  OrgLookupQueryParams,
  CreateOrgDepartmentDto,
  CreateOrgTitleDto,
  CreateOrgLocationDto,
  UpdateOrgDepartmentDto,
  UpdateOrgTitleDto,
  UpdateOrgLocationDto,
} from "../types";

// ==================== QUERY KEYS ====================

export const orgLookupKeys = {
  departments: {
    all: ["org-departments"] as const,
    list: (params?: OrgLookupQueryParams) =>
      [...orgLookupKeys.departments.all, "list", params] as const,
    active: () => [...orgLookupKeys.departments.all, "active"] as const,
    detail: (id: string) => [...orgLookupKeys.departments.all, "detail", id] as const,
  },
  titles: {
    all: ["org-titles"] as const,
    list: (params?: OrgLookupQueryParams) =>
      [...orgLookupKeys.titles.all, "list", params] as const,
    active: () => [...orgLookupKeys.titles.all, "active"] as const,
    detail: (id: string) => [...orgLookupKeys.titles.all, "detail", id] as const,
  },
  locations: {
    all: ["org-locations"] as const,
    list: (params?: OrgLookupQueryParams) =>
      [...orgLookupKeys.locations.all, "list", params] as const,
    active: () => [...orgLookupKeys.locations.all, "active"] as const,
    detail: (id: string) => [...orgLookupKeys.locations.all, "detail", id] as const,
  },
};

// ==================== DEPARTMENTS HOOKS ====================

export function useOrgDepartments(params?: OrgLookupQueryParams) {
  return useQuery({
    queryKey: orgLookupKeys.departments.list(params),
    queryFn: () => orgDepartmentApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrgDepartmentsActive() {
  return useQuery({
    queryKey: orgLookupKeys.departments.active(),
    queryFn: () => orgDepartmentApi.listActive(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateOrgDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgDepartmentDto) => orgDepartmentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.departments.all });
    },
  });
}

export function useUpdateOrgDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgDepartmentDto }) =>
      orgDepartmentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.departments.all });
    },
  });
}

export function useDeleteOrgDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orgDepartmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.departments.all });
    },
  });
}

// ==================== TITLES HOOKS ====================

export function useOrgTitles(params?: OrgLookupQueryParams) {
  return useQuery({
    queryKey: orgLookupKeys.titles.list(params),
    queryFn: () => orgTitleApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrgTitlesActive() {
  return useQuery({
    queryKey: orgLookupKeys.titles.active(),
    queryFn: () => orgTitleApi.listActive(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateOrgTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgTitleDto) => orgTitleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.titles.all });
    },
  });
}

export function useUpdateOrgTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgTitleDto }) =>
      orgTitleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.titles.all });
    },
  });
}

export function useDeleteOrgTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orgTitleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.titles.all });
    },
  });
}

// ==================== LOCATIONS HOOKS ====================

export function useOrgLocations(params?: OrgLookupQueryParams) {
  return useQuery({
    queryKey: orgLookupKeys.locations.list(params),
    queryFn: () => orgLocationApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useOrgLocationsActive() {
  return useQuery({
    queryKey: orgLookupKeys.locations.active(),
    queryFn: () => orgLocationApi.listActive(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateOrgLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrgLocationDto) => orgLocationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.locations.all });
    },
  });
}

export function useUpdateOrgLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgLocationDto }) =>
      orgLocationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.locations.all });
    },
  });
}

export function useDeleteOrgLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orgLocationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgLookupKeys.locations.all });
    },
  });
}
