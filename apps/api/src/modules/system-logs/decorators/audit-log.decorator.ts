import { SetMetadata } from "@nestjs/common";

export const AUDIT_LOG_KEY = "audit_log";

export interface AuditLogOptions {
  /** Modül adı (ör: "licenses", "contracts") */
  module: string;
  /** Entity tipi (ör: "License", "Contract") */
  entityType: string;
}

/**
 * Controller method'larına otomatik CRUD loglama ekler.
 * AuditLogInterceptor ile birlikte çalışır.
 *
 * @example
 * @AuditLog({ module: "licenses", entityType: "License" })
 * @Post()
 * create(@Body() dto: CreateLicenseDto) { ... }
 */
export const AuditLog = (options: AuditLogOptions) =>
  SetMetadata(AUDIT_LOG_KEY, options);
