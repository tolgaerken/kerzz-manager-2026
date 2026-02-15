import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/apiClient";
import { ENDPOINTS } from "../constants";
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

// ============ Lisans API'leri ============

/**
 * Tüm Boss lisanslarını getir
 */
export async function getLicenses(): Promise<BossLicenseUser[]> {
  return apiGet<BossLicenseUser[]>(ENDPOINTS.LICENSES);
}

/**
 * Kullanıcının Boss lisanslarını getir
 */
export async function getLicensesByUser(userId: string): Promise<BossLicenseUser[]> {
  return apiGet<BossLicenseUser[]>(ENDPOINTS.LICENSES_BY_USER(userId));
}

/**
 * Lisans oluştur veya güncelle
 */
export async function upsertLicense(dto: CreateBossLicenseDto): Promise<BossLicenseUser> {
  return apiPost<BossLicenseUser>(ENDPOINTS.LICENSES, dto);
}

/**
 * Lisans güncelle
 */
export async function updateLicense(
  id: string,
  dto: UpdateBossLicenseDto
): Promise<BossLicenseUser> {
  return apiPut<BossLicenseUser>(ENDPOINTS.LICENSE(id), dto);
}

/**
 * Lisans sil
 */
export async function deleteLicense(id: string): Promise<void> {
  return apiDelete<void>(ENDPOINTS.LICENSE(id));
}

/**
 * Şube yetkilerini güncelle
 */
export async function updateBranches(
  id: string,
  dto: UpdateBranchesDto
): Promise<BossLicenseUser> {
  return apiPut<BossLicenseUser>(ENDPOINTS.LICENSE_BRANCHES(id), dto);
}

/**
 * Kullanıcıyı engelle
 */
export async function blockUser(id: string, dto: BlockUserDto): Promise<BossLicenseUser> {
  return apiPut<BossLicenseUser>(ENDPOINTS.LICENSE_BLOCK(id), dto);
}

/**
 * Engeli kaldır
 */
export async function unblockUser(id: string): Promise<BossLicenseUser> {
  return apiPut<BossLicenseUser>(ENDPOINTS.LICENSE_UNBLOCK(id));
}

// ============ Şube API'leri ============

/**
 * Şubeleri getir
 */
export async function getBranches(licanceId: string): Promise<Branch[]> {
  return apiGet<Branch[]>(ENDPOINTS.BRANCHES(licanceId));
}

// ============ Kullanıcı API'leri ============

/**
 * Kullanıcı oluştur veya güncelle
 */
export async function upsertUser(dto: UpsertUserDto): Promise<SsoUser> {
  return apiPost<SsoUser>(ENDPOINTS.USERS, dto);
}

/**
 * Kullanıcıyı ID ile getir
 */
export async function getUserById(userId: string): Promise<SsoUser | null> {
  return apiGet<SsoUser | null>(ENDPOINTS.USER(userId));
}

/**
 * Kullanıcıyı telefon ile ara
 */
export async function findUserByPhone(phone: string): Promise<SsoUser | null> {
  return apiGet<SsoUser | null>(`${ENDPOINTS.USER_BY_PHONE}?phone=${encodeURIComponent(phone)}`);
}

/**
 * Kullanıcıyı email ile ara
 */
export async function findUserByEmail(email: string): Promise<SsoUser | null> {
  return apiGet<SsoUser | null>(`${ENDPOINTS.USER_BY_EMAIL}?email=${encodeURIComponent(email)}`);
}

// ============ Bildirim API'leri ============

/**
 * Bildirim gönder
 */
export async function sendNotification(dto: SendNotificationDto): Promise<NotificationResult> {
  return apiPost<NotificationResult>(ENDPOINTS.NOTIFY, dto);
}
