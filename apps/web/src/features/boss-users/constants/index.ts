/** Kerzz Boss app_id */
export const KERZZ_BOSS_APP_ID = "2a17-a038";

/** API Base URL */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3888/api";

/** Boss Users API Endpoints */
export const ENDPOINTS = {
  /** Tüm lisansları getir */
  LICENSES: `${API_BASE_URL}/boss-users/licenses`,
  /** Kullanıcının lisansları */
  LICENSES_BY_USER: (userId: string) => `${API_BASE_URL}/boss-users/licenses/user/${userId}`,
  /** Lisans detay */
  LICENSE: (id: string) => `${API_BASE_URL}/boss-users/licenses/${id}`,
  /** Şube yetkileri */
  LICENSE_BRANCHES: (id: string) => `${API_BASE_URL}/boss-users/licenses/${id}/branches`,
  /** Engelleme */
  LICENSE_BLOCK: (id: string) => `${API_BASE_URL}/boss-users/licenses/${id}/block`,
  /** Engel kaldırma */
  LICENSE_UNBLOCK: (id: string) => `${API_BASE_URL}/boss-users/licenses/${id}/unblock`,
  /** Şubeleri getir */
  BRANCHES: (licanceId: string) => `${API_BASE_URL}/boss-users/branches/${licanceId}`,
  /** Kullanıcılar */
  USERS: `${API_BASE_URL}/boss-users/users`,
  /** Kullanıcı detay */
  USER: (userId: string) => `${API_BASE_URL}/boss-users/users/${userId}`,
  /** Telefon ile kullanıcı ara */
  USER_BY_PHONE: `${API_BASE_URL}/boss-users/users/by-phone`,
  /** Email ile kullanıcı ara */
  USER_BY_EMAIL: `${API_BASE_URL}/boss-users/users/by-email`,
  /** Bildirim gönder */
  NOTIFY: `${API_BASE_URL}/boss-users/notify`,
} as const;

/** Grid state key */
export const GRID_STATE_KEY = "boss-users-grid";

/** Query keys */
export const QUERY_KEYS = {
  LICENSES: ["boss-users", "licenses"] as const,
  LICENSES_BY_USER: (userId: string) => ["boss-users", "licenses", "user", userId] as const,
  BRANCHES: (licanceId: string) => ["boss-users", "branches", licanceId] as const,
  USER: (userId: string) => ["boss-users", "user", userId] as const,
} as const;
