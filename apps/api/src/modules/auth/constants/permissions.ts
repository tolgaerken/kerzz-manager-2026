/**
 * Uygulama izin sabitleri
 * Bu izinler SSO sistemindeki permission değerleriyle eşleşmelidir
 * Frontend ile senkron tutulmalıdır
 *
 * Format: KERZZ_MANAGER_<MODUL>_<ISLEM>
 */
export const PERMISSIONS = {
  /** Dashboard'ları görüntüleme yetkisi */
  DASHBOARD_VIEW: "KERZZ_MANAGER_DASHBOARD_VIEW",

  /** Kontrat menüsüne erişim yetkisi */
  CONTRACT_MENU: "KERZZ_MANAGER_CONTRACT_MENU",

  /** Müşteriler menüsüne erişim yetkisi */
  CUSTOMER_MENU: "KERZZ_MANAGER_CUSTOMER_MENU",

  /** Lisans menüsüne erişim yetkisi */
  LICENSE_MENU: "KERZZ_MANAGER_LICENSE_MENU",

  /** Finans menüsüne erişim yetkisi */
  FINANCE_MENU: "KERZZ_MANAGER_FINANCE_MENU",

  /** Satış menüsüne erişim yetkisi */
  SALES_MENU: "KERZZ_MANAGER_SALES_MENU",

  /** E-Belge menüsüne erişim yetkisi */
  EDOC_MENU: "KERZZ_MANAGER_EDOC_MENU",

  /** Sistem menüsüne erişim yetkisi */
  SYSTEM_MENU: "KERZZ_MANAGER_SYSTEM_MENU",

  /** Bildirimler menüsüne erişim yetkisi */
  NOTIFICATION_MENU: "KERZZ_MANAGER_NOTIFICATION_MENU",

  /** SSO Yönetim menüsüne erişim yetkisi */
  SSO_MANAGEMENT_MENU: "KERZZ_MANAGER_SSO_MANAGEMENT_MENU",

  /** Grid toplamlarını görüntüleme yetkisi */
  GRID_TOTALS_VIEW: "KERZZ_MANAGER_GRID_TOTALS_VIEW",

  /** Kar/Zarar bilgilerini görüntüleme yetkisi */
  PROFIT_LOSS_VIEW: "KERZZ_MANAGER_PROFIT_LOSS_VIEW",

  /** Çalışan Profili menüsüne erişim yetkisi */
  EMPLOYEE_PROFILE_MENU: "KERZZ_MANAGER_EMPLOYEE_PROFILE_MENU",

  /** Çalışan Profili - tüm profilleri düzenleme yetkisi (Admin/İK) */
  EMPLOYEE_PROFILE_EDIT_ALL: "KERZZ_MANAGER_EMPLOYEE_PROFILE_EDIT_ALL",

  /** Çalışan Profili - kendi profilini düzenleme yetkisi (Self-Service) */
  EMPLOYEE_PROFILE_EDIT_SELF: "KERZZ_MANAGER_EMPLOYEE_PROFILE_EDIT_SELF",

  /** Çalışan Profili - hassas alanları görüntüleme yetkisi (TCKN, maaş vb.) */
  EMPLOYEE_PROFILE_VIEW_SENSITIVE: "KERZZ_MANAGER_EMPLOYEE_PROFILE_VIEW_SENSITIVE",

  /** Geribildirim menüsüne erişim yetkisi */
  FEEDBACK_MENU: "KERZZ_MANAGER_FEEDBACK_MENU",

  /** Satış onaylama yetkisi */
  SALES_APPROVE: "KERZZ_MANAGER_SALES_APPROVE",
} as const;

/** İzin tipi - type-safe kullanım için */
export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];
