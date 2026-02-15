import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeProfileApi } from "../api/employeeProfileApi";
import type {
  EmployeeProfileQueryParams,
  CreateEmployeeProfileFormData,
  UpdateEmployeeProfileFormData,
  UpdateSelfProfileFormData,
} from "../types";

/**
 * Query keys for employee profiles
 */
export const employeeProfileKeys = {
  all: ["employee-profiles"] as const,
  list: (params?: EmployeeProfileQueryParams) =>
    [...employeeProfileKeys.all, "list", params] as const,
  detail: (userId: string) => [...employeeProfileKeys.all, "detail", userId] as const,
  myProfile: () => [...employeeProfileKeys.all, "me"] as const,
  stats: () => [...employeeProfileKeys.all, "stats"] as const,
  byDepartment: (departmentCode: string) =>
    [...employeeProfileKeys.all, "by-department", departmentCode] as const,
  byManager: (managerUserId: string) =>
    [...employeeProfileKeys.all, "by-manager", managerUserId] as const,
};

/**
 * Çalışan profilleri listesi hook'u
 */
export function useEmployeeProfiles(params?: EmployeeProfileQueryParams) {
  return useQuery({
    queryKey: employeeProfileKeys.list(params),
    queryFn: () => employeeProfileApi.list(params),
    staleTime: 1000 * 60 * 2, // 2 dakika
  });
}

/**
 * Tek çalışan profili hook'u
 */
export function useEmployeeProfile(userId: string | null) {
  return useQuery({
    queryKey: employeeProfileKeys.detail(userId || ""),
    queryFn: () => employeeProfileApi.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Kendi profilim hook'u (self-service)
 */
export function useMyProfile() {
  return useQuery({
    queryKey: employeeProfileKeys.myProfile(),
    queryFn: () => employeeProfileApi.getMyProfile(),
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
}

/**
 * İstatistikler hook'u
 */
export function useEmployeeProfileStats() {
  return useQuery({
    queryKey: employeeProfileKeys.stats(),
    queryFn: () => employeeProfileApi.getStats(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Departmana göre çalışanlar hook'u
 */
export function useEmployeesByDepartment(departmentCode: string | null) {
  return useQuery({
    queryKey: employeeProfileKeys.byDepartment(departmentCode || ""),
    queryFn: () => employeeProfileApi.getByDepartment(departmentCode!),
    enabled: !!departmentCode,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Yöneticiye bağlı çalışanlar hook'u
 */
export function useEmployeesByManager(managerUserId: string | null) {
  return useQuery({
    queryKey: employeeProfileKeys.byManager(managerUserId || ""),
    queryFn: () => employeeProfileApi.getByManager(managerUserId!),
    enabled: !!managerUserId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Yeni profil oluşturma mutation hook'u (Admin/İK)
 */
export function useCreateEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeProfileFormData) => employeeProfileApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.all });
    },
  });
}

/**
 * Profil güncelleme mutation hook'u (Admin/İK)
 */
export function useUpdateEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateEmployeeProfileFormData }) =>
      employeeProfileApi.update(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.detail(userId) });
    },
  });
}

/**
 * Kendi profilimi güncelleme mutation hook'u (Self-Service)
 */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSelfProfileFormData) => employeeProfileApi.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.myProfile() });
    },
  });
}

/**
 * Profil soft-delete mutation hook'u
 */
export function useSoftDeleteEmployeeProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, terminationReason }: { userId: string; terminationReason: string }) =>
      employeeProfileApi.softDelete(userId, terminationReason),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.detail(userId) });
    },
  });
}

/**
 * Toplu profil oluşturma mutation hook'u (backfill)
 */
export function useBulkCreateEmployeeProfiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => employeeProfileApi.bulkCreate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeProfileKeys.all });
    },
  });
}
