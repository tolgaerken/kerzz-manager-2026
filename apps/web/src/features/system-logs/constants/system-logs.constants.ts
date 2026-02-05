export const SYSTEM_LOGS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    SYSTEM_LOGS: "/system-logs",
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200],
};

/** Kategori etiketleri */
export const CATEGORY_LABELS: Record<string, string> = {
  AUTH: "Kimlik Doğrulama",
  CRUD: "Veri İşlemi",
  CRON: "Zamanlanmış Görev",
  SYSTEM: "Sistem",
};

/** Aksiyon etiketleri */
export const ACTION_LABELS: Record<string, string> = {
  LOGIN: "Giriş",
  LOGOUT: "Çıkış",
  LOGIN_FAILED: "Başarısız Giriş",
  TOKEN_REFRESH: "Token Yenileme",
  CREATE: "Oluşturma",
  READ: "Okuma",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
  CRON_START: "Cron Başladı",
  CRON_END: "Cron Bitti",
  CRON_FAILED: "Cron Başarısız",
  ERROR: "Hata",
  WARNING: "Uyarı",
  INFO: "Bilgi",
};

/** Durum etiketleri */
export const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Başarılı",
  FAILURE: "Başarısız",
  ERROR: "Hata",
};

/** Modül etiketleri */
export const MODULE_LABELS: Record<string, string> = {
  auth: "Kimlik Doğrulama",
  licenses: "Lisanslar",
  contracts: "Kontratlar",
  customers: "Müşteriler",
  invoices: "Faturalar",
  "hardware-products": "Donanım Ürünleri",
  "software-products": "Yazılım Ürünleri",
  "eft-pos-models": "EFT POS Modeller",
  "contract-users": "Kontrat Kullanıcıları",
  "contract-supports": "Kontrat Destek",
  "contract-saas": "Kontrat SaaS",
  "contract-cash-registers": "Yazarkasalar",
  "contract-versions": "Kontrat Versiyonları",
  "contract-items": "Kontrat Kalemleri",
  "contract-documents": "Kontrat Belgeleri",
  "contract-payments": "Kontrat Ödemeleri",
  system: "Sistem",
};

/** Kategori renkleri */
export const CATEGORY_COLORS: Record<string, string> = {
  AUTH: "blue",
  CRUD: "green",
  CRON: "purple",
  SYSTEM: "orange",
};

/** Durum renkleri */
export const STATUS_COLORS: Record<string, string> = {
  SUCCESS: "green",
  FAILURE: "yellow",
  ERROR: "red",
};

/** Aksiyon renkleri */
export const ACTION_COLORS: Record<string, string> = {
  LOGIN: "blue",
  LOGOUT: "gray",
  LOGIN_FAILED: "red",
  TOKEN_REFRESH: "blue",
  CREATE: "green",
  READ: "gray",
  UPDATE: "yellow",
  DELETE: "red",
  CRON_START: "purple",
  CRON_END: "purple",
  CRON_FAILED: "red",
  ERROR: "red",
  WARNING: "yellow",
  INFO: "blue",
};
