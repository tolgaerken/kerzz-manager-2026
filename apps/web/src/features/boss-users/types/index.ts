/**
 * Kerzz Boss lisans kullanıcısı - grid'de gösterilen zenginleştirilmiş veri
 */
export interface BossLicenseUser {
  id: string;
  app_id: string;
  user_id: string;
  user_name?: string;
  licance_id?: string;
  brand?: string;
  roles: string[];
  branchCodes?: string[];
  statusText?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  // User bilgileri (join)
  customerId?: string;
  customerName?: string;
  mail?: string;
  phone?: string;
  lastLoginDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Şube bilgisi
 */
export interface Branch {
  id: string;
  name: string;
  isActive: boolean;
  selected?: boolean;
}

/**
 * SSO Kullanıcı
 */
export interface SsoUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  customerId?: string;
  isActive: boolean;
  lastLoginDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Lisans oluşturma/güncelleme DTO
 */
export interface CreateBossLicenseDto {
  id?: string;
  user_id: string;
  user_name?: string;
  licance_id: string;
  brand?: string;
  roles?: string[];
  branchCodes?: string[];
}

/**
 * Lisans güncelleme DTO
 */
export interface UpdateBossLicenseDto {
  user_name?: string;
  licance_id?: string;
  brand?: string;
  roles?: string[];
  branchCodes?: string[];
  statusText?: string;
  is_active?: boolean;
}

/**
 * Şube yetkilerini güncelleme DTO
 */
export interface UpdateBranchesDto {
  branchCodes: string[];
}

/**
 * Engelleme DTO
 */
export interface BlockUserDto {
  message: string;
  paymentLink?: string;
  type?: "block" | "info";
}

/**
 * Bildirim gönderme DTO
 */
export interface SendNotificationDto {
  user_id: string;
  sendSms?: boolean;
  sendEmail?: boolean;
  customMessage?: string;
}

/**
 * Kullanıcı oluşturma/güncelleme DTO
 */
export interface UpsertUserDto {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  customerId: string;
}

/**
 * Bildirim sonucu
 */
export interface NotificationResult {
  sms?: {
    success: boolean;
    messageId?: string;
    error?: string;
  };
  email?: {
    success: boolean;
    messageId?: string;
    error?: string;
  };
}

/**
 * StatusText parse edilmiş hali
 */
export interface ParsedStatusText {
  type: "block" | "info";
  message: string;
  paymentLink?: string;
  blockedAt?: string;
}

