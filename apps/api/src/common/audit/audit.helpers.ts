import { ClsServiceManager } from "nestjs-cls";
import { AuditUser, AUDIT_CLS_KEY } from "./audit.interfaces";

/**
 * CLS'den mevcut kullanıcıyı okur.
 * bulkWrite, insertMany gibi middleware çalıştırmayan işlemlerde
 * manuel olarak audit alanları eklemek için kullanılır.
 *
 * @returns AuditUser | null
 */
export function getCurrentAuditUser(): AuditUser | null {
  try {
    const cls = ClsServiceManager.getClsService();
    if (!cls || !cls.isActive()) {
      return null;
    }
    return cls.get<AuditUser | undefined>(AUDIT_CLS_KEY) ?? null;
  } catch {
    return null;
  }
}

/**
 * Yeni doküman için audit + timestamp alanlarını oluşturur.
 * insertMany işlemlerinde kullanılır.
 */
export function getAuditFieldsForCreate(): {
  "audit.createdBy.userId": string | null;
  "audit.createdBy.userName": string | null;
  "audit.updatedBy.userId": string | null;
  "audit.updatedBy.userName": string | null;
  createdAt: Date;
  updatedAt: Date;
} {
  const user = getCurrentAuditUser();
  const now = new Date();
  return {
    "audit.createdBy.userId": user?.userId ?? null,
    "audit.createdBy.userName": user?.userName ?? null,
    "audit.updatedBy.userId": user?.userId ?? null,
    "audit.updatedBy.userName": user?.userName ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Güncelleme için audit + timestamp alanlarını oluşturur.
 * bulkWrite update işlemlerinde $set ile kullanılır.
 */
export function getAuditFieldsForUpdate(): {
  "audit.updatedBy.userId": string | null;
  "audit.updatedBy.userName": string | null;
  updatedAt: Date;
} {
  const user = getCurrentAuditUser();
  return {
    "audit.updatedBy.userId": user?.userId ?? null,
    "audit.updatedBy.userName": user?.userName ?? null,
    updatedAt: new Date(),
  };
}

/**
 * Sadece createdBy + createdAt alanlarını oluşturur.
 * bulkWrite upsert işlemlerinde $setOnInsert ile kullanılır.
 * ($set içinde zaten updatedBy + updatedAt olduğunda çakışmayı önler)
 */
export function getAuditFieldsForSetOnInsert(): {
  "audit.createdBy.userId": string | null;
  "audit.createdBy.userName": string | null;
  createdAt: Date;
} {
  const user = getCurrentAuditUser();
  return {
    "audit.createdBy.userId": user?.userId ?? null,
    "audit.createdBy.userName": user?.userName ?? null,
    createdAt: new Date(),
  };
}
