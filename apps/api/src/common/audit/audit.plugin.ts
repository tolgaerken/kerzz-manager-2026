import { Schema } from "mongoose";
import { ClsServiceManager } from "nestjs-cls";
import { AuditUser, AUDIT_CLS_KEY } from "./audit.interfaces";

/**
 * CLS'den mevcut kullanıcıyı okur
 * CLS aktif değilse veya kullanıcı yoksa null döner
 */
function getCurrentUser(): AuditUser | null {
  try {
    const cls = ClsServiceManager.getClsService();
    if (!cls || !cls.isActive()) {
      return null;
    }
    return cls.get<AuditUser | undefined>(AUDIT_CLS_KEY) ?? null;
  } catch {
    // CLS henüz initialize edilmemiş olabilir (app startup sırasında)
    return null;
  }
}

// Plugin'in birden fazla kez uygulanmasını önlemek için symbol
const AUDIT_PLUGIN_APPLIED = Symbol("auditPluginApplied");

/**
 * Global Mongoose Audit Plugin
 *
 * Her save/update işleminde audit alanlarını otomatik olarak set eder:
 * - Yeni doküman: audit.createdBy + audit.updatedBy
 * - Mevcut doküman: sadece audit.updatedBy
 *
 * CLS'de kullanıcı yoksa (public endpoint, cron job) alanlar null kalır.
 */
export function auditPlugin(schema: Schema): void {
  // Plugin'in birden fazla kez uygulanmasını önle
  if ((schema as unknown as Record<symbol, boolean>)[AUDIT_PLUGIN_APPLIED]) {
    return;
  }
  (schema as unknown as Record<symbol, boolean>)[AUDIT_PLUGIN_APPLIED] = true;

  // Audit alanlarını ekle (düz yapı)
  schema.add({
    "audit.createdBy.userId": { type: String, default: null },
    "audit.createdBy.userName": { type: String, default: null },
    "audit.updatedBy.userId": { type: String, default: null },
    "audit.updatedBy.userName": { type: String, default: null },
  });

  // Pre-save hook: yeni doküman veya mevcut doküman güncellemesi
  schema.pre("save", function () {
    const user = getCurrentUser();

    if (this.isNew) {
      // Yeni doküman: createdBy ve updatedBy set et
      if (user) {
        this.set("audit.createdBy.userId", user.userId);
        this.set("audit.createdBy.userName", user.userName);
        this.set("audit.updatedBy.userId", user.userId);
        this.set("audit.updatedBy.userName", user.userName);
      }
    } else {
      // Mevcut doküman: sadece updatedBy güncelle
      if (user) {
        this.set("audit.updatedBy.userId", user.userId);
        this.set("audit.updatedBy.userName", user.userName);
      }
    }
  });

  // Pre-findOneAndUpdate hook
  schema.pre("findOneAndUpdate", function () {
    const user = getCurrentUser();
    if (user) {
      this.set({
        "audit.updatedBy.userId": user.userId,
        "audit.updatedBy.userName": user.userName,
      });
    }
  });

  // Pre-updateOne hook
  schema.pre("updateOne", function () {
    const user = getCurrentUser();
    if (user) {
      this.set({
        "audit.updatedBy.userId": user.userId,
        "audit.updatedBy.userName": user.userName,
      });
    }
  });

  // Pre-updateMany hook
  schema.pre("updateMany", function () {
    const user = getCurrentUser();
    if (user) {
      this.set({
        "audit.updatedBy.userId": user.userId,
        "audit.updatedBy.userName": user.userName,
      });
    }
  });

  // Pre-findOneAndReplace hook
  schema.pre("findOneAndReplace", function () {
    const user = getCurrentUser();
    if (user) {
      this.set({
        "audit.updatedBy.userId": user.userId,
        "audit.updatedBy.userName": user.userName,
      });
    }
  });

  // Pre-replaceOne hook
  schema.pre("replaceOne", function () {
    const user = getCurrentUser();
    if (user) {
      this.set({
        "audit.updatedBy.userId": user.userId,
        "audit.updatedBy.userName": user.userName,
      });
    }
  });
}
