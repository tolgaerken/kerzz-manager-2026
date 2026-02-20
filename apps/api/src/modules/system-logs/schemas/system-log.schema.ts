import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type SystemLogDocument = SystemLog & Document & AuditFields;

/**
 * Sistem log kategorileri
 */
export enum SystemLogCategory {
  AUTH = "AUTH",
  CRUD = "CRUD",
  CRON = "CRON",
  SYSTEM = "SYSTEM",
}

/**
 * Sistem log aksiyonları
 */
export enum SystemLogAction {
  // Auth
  LOGIN = "LOGIN",
  LOGOUT = "LOGOUT",
  LOGIN_FAILED = "LOGIN_FAILED",
  TOKEN_REFRESH = "TOKEN_REFRESH",
  // CRUD
  CREATE = "CREATE",
  READ = "READ",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  // Cron
  CRON_START = "CRON_START",
  CRON_END = "CRON_END",
  CRON_FAILED = "CRON_FAILED",
  // System
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
  // Payment
  PAYMENT_LINK_OPENED = "PAYMENT_LINK_OPENED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  // Payment - Invoice/Contract marking
  INVOICE_MARKED_PAID = "INVOICE_MARKED_PAID",
  INVOICE_MARKING_FAILED = "INVOICE_MARKING_FAILED",
  // Contract renewal/termination
  CONTRACT_RENEWAL_TRIGGERED = "CONTRACT_RENEWAL_TRIGGERED",
  CONTRACT_RENEWAL_FAILED = "CONTRACT_RENEWAL_FAILED",
  CONTRACT_TERMINATION_TRIGGERED = "CONTRACT_TERMINATION_TRIGGERED",
  CONTRACT_NOTIFICATION_SENT = "CONTRACT_NOTIFICATION_SENT",
  CONTRACT_NOTIFICATION_FAILED = "CONTRACT_NOTIFICATION_FAILED",
}

/**
 * Log durumu
 */
export enum SystemLogStatus {
  SUCCESS = "SUCCESS",
  FAILURE = "FAILURE",
  ERROR = "ERROR",
}

@Schema({ collection: "system_logs", timestamps: true })
export class SystemLog {
  _id: Types.ObjectId;

  @Prop({ required: true, enum: SystemLogCategory, index: true })
  category: SystemLogCategory;

  @Prop({ required: true, enum: SystemLogAction, index: true })
  action: SystemLogAction;

  @Prop({ required: true, index: true })
  module: string;

  @Prop({ type: String, index: true, default: null })
  userId: string | null;

  @Prop({ type: String, default: null })
  userName: string | null;

  @Prop({ type: String, default: null })
  entityId: string | null;

  @Prop({ type: String, default: null })
  entityType: string | null;

  @Prop({ type: Object, default: {} })
  details: Record<string, unknown>;

  @Prop({ type: String, default: null })
  ipAddress: string | null;

  @Prop({ type: String, default: null })
  userAgent: string | null;

  @Prop({ type: Number, default: null })
  duration: number | null;

  @Prop({ required: true, enum: SystemLogStatus, default: SystemLogStatus.SUCCESS })
  status: SystemLogStatus;

  @Prop({ type: String, default: null })
  errorMessage: string | null;

  @Prop({ type: String, default: null })
  method: string | null;

  @Prop({ type: String, default: null })
  path: string | null;

  @Prop({ type: Number, default: null })
  statusCode: number | null;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const SystemLogSchema = SchemaFactory.createForClass(SystemLog);

// Compound indexes
SystemLogSchema.index({ category: 1, createdAt: -1 });
SystemLogSchema.index({ userId: 1, createdAt: -1 });
SystemLogSchema.index({ module: 1, action: 1, createdAt: -1 });
SystemLogSchema.index({ status: 1, createdAt: -1 });

// TTL index - logları 90 gün sonra otomatik sil
SystemLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
