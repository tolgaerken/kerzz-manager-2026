/**
 * Audit User - Dokümana yazılacak kullanıcı bilgisi
 */
export interface AuditUser {
  userId: string;
  userName: string;
}

/**
 * Audit Fields - Tüm auditable dokümanlarda bulunacak alanlar
 */
export interface AuditFields {
  audit?: {
    createdBy?: AuditUser | null;
    updatedBy?: AuditUser | null;
  };
}

/**
 * CLS'de saklanan audit context
 */
export interface AuditContext {
  user?: AuditUser;
}

/**
 * CLS key constants
 */
export const AUDIT_CLS_KEY = "audit_user";
