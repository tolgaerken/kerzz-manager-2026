/**
 * Uygulama izin sabitleri
 * Bu izinler SSO sistemindeki permission değerleriyle eşleşmelidir
 * Frontend ile senkron tutulmalıdır
 */
export const PERMISSIONS = {
  /** Dashboard'ları görüntüleme yetkisi */
  DASHBOARD_VIEW: "Dashboardları Görebilir",

  /** Kontrat menüsüne erişim yetkisi */
  CONTRACT_MENU: "Kontrat Menüsü",

  /** Müşteriler menüsüne erişim yetkisi */
  CUSTOMER_MENU: "Müşteriler Menüsü",

  /** Lisans menüsüne erişim yetkisi */
  LICENSE_MENU: "Lisans Menüsü",

  /** Finans menüsüne erişim yetkisi */
  FINANCE_MENU: "Finans Menüsü",

  /** Satış menüsüne erişim yetkisi */
  SALES_MENU: "Satış Menüsü",

  /** E-Belge menüsüne erişim yetkisi */
  EDOC_MENU: "E-Belge Menüsü",

  /** Sistem menüsüne erişim yetkisi */
  SYSTEM_MENU: "Sistem Menüsü",

  /** Bildirimler menüsüne erişim yetkisi */
  NOTIFICATION_MENU: "Bildirimler Menüsü",

  /** SSO Yönetim menüsüne erişim yetkisi */
  SSO_MANAGEMENT_MENU: "SSO Yönetim Menüsü",

  /** Grid toplamlarını görüntüleme yetkisi */
  GRID_TOTALS_VIEW: "Grid Toplamlarını Görebilir",

  /** Kar/Zarar bilgilerini görüntüleme yetkisi */
  PROFIT_LOSS_VIEW: "Kar / Zarar Bilgilerini Görebilir",

  /** Çalışan Profili menüsüne erişim yetkisi */
  EMPLOYEE_PROFILE_MENU: "Çalışan Profili Menüsü",

  /** Çalışan Profili - tüm profilleri düzenleme yetkisi (Admin/İK) */
  EMPLOYEE_PROFILE_EDIT_ALL: "Çalışan Profili Tümünü Düzenle",

  /** Çalışan Profili - kendi profilini düzenleme yetkisi (Self-Service) */
  EMPLOYEE_PROFILE_EDIT_SELF: "Çalışan Profili Kendini Düzenle",

  /** Çalışan Profili - hassas alanları görüntüleme yetkisi (TCKN, maaş vb.) */
  EMPLOYEE_PROFILE_VIEW_SENSITIVE: "Çalışan Profili Hassas Bilgileri Gör",
} as const;

/** İzin tipi - type-safe kullanım için */
export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = (typeof PERMISSIONS)[PermissionKey];
