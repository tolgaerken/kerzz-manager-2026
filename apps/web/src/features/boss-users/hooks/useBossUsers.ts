import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS, KERZZ_BOSS_APP_ID } from "../constants";
import * as api from "../api/bossUsersApi";
import { useRoles } from "../../sso-management/hooks/useRoles";
import type {
  BossLicenseUser,
  Branch,
  SsoUser,
  CreateBossLicenseDto,
  UpdateBossLicenseDto,
  UpdateBranchesDto,
  BlockUserDto,
  SendNotificationDto,
  UpsertUserDto,
  NotificationResult
} from "../types";

// ============ Lisans Hooks ============

/**
 * Tüm Boss lisanslarını getir
 */
export function useBossLicenses() {
  return useQuery({
    queryKey: QUERY_KEYS.LICENSES,
    queryFn: api.getLicenses
  });
}

/**
 * Kullanıcının Boss lisanslarını getir
 */
export function useBossLicensesByUser(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.LICENSES_BY_USER(userId || ""),
    queryFn: () => api.getLicensesByUser(userId!),
    enabled: !!userId
  });
}

/**
 * Lisans oluştur veya güncelle
 */
export function useUpsertLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateBossLicenseDto) => api.upsertLicense(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

/**
 * Lisans güncelle
 */
export function useUpdateLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBossLicenseDto }) =>
      api.updateLicense(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

/**
 * Lisans sil
 */
export function useDeleteLicense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

/**
 * Şube yetkilerini güncelle
 */
export function useUpdateBranches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBranchesDto }) =>
      api.updateBranches(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

/**
 * Kullanıcıyı engelle
 */
export function useBlockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: BlockUserDto }) => api.blockUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

/**
 * Engeli kaldır
 */
export function useUnblockUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.unblockUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
    }
  });
}

// ============ Şube Hooks ============

/**
 * Şubeleri getir
 */
export function useBranches(licanceId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.BRANCHES(licanceId || ""),
    queryFn: () => api.getBranches(licanceId!),
    enabled: !!licanceId
  });
}

// ============ Kullanıcı Hooks ============

/**
 * Kullanıcıyı ID ile getir
 */
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.USER(userId || ""),
    queryFn: () => api.getUserById(userId!),
    enabled: !!userId
  });
}

/**
 * Kullanıcı oluştur veya güncelle
 */
export function useUpsertUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpsertUserDto) => api.upsertUser(dto),
    onSuccess: (user) => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER(user.id) });
      }
    }
  });
}

/**
 * Telefon ile kullanıcı ara
 */
export function useFindUserByPhone() {
  return useMutation({
    mutationFn: (phone: string) => api.findUserByPhone(phone)
  });
}

/**
 * Email ile kullanıcı ara
 */
export function useFindUserByEmail() {
  return useMutation({
    mutationFn: (email: string) => api.findUserByEmail(email)
  });
}

// ============ Bildirim Hooks ============

/**
 * Bildirim gönder
 */
export function useSendNotification() {
  return useMutation({
    mutationFn: (dto: SendNotificationDto) => api.sendNotification(dto)
  });
}

// ============ Roller Hooks ============

/**
 * Kerzz Boss rollerini getir
 */
export function useBossRoles() {
  const appRolesQuery = useRoles({ appId: KERZZ_BOSS_APP_ID, includeInactive: true });
  const allRolesQuery = useRoles({ all: true, includeInactive: true });

  const appRoles = appRolesQuery.data ?? [];
  const fallbackRoles = allRolesQuery.data ?? [];
  const roles = appRoles.length > 0 ? appRoles : fallbackRoles;

  return {
    ...appRolesQuery,
    data: roles,
    isLoading: appRolesQuery.isLoading || (appRoles.length === 0 && allRolesQuery.isLoading),
    isFetching: appRolesQuery.isFetching || (appRoles.length === 0 && allRolesQuery.isFetching)
  };
}

// ============ Utility Hooks ============

/**
 * Lisansları yenile
 */
export function useRefreshLicenses() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LICENSES });
  };
}
