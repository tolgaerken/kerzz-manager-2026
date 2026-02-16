import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type NotificationLogDocument = NotificationLog & Document & AuditFields;

export type NotificationLogStatus = "sent" | "failed";
export type NotificationLogChannel = "email" | "sms";
export type NotificationLogContextType = "invoice" | "contract";

@Schema({ collection: "notification-logs", timestamps: true })
export class NotificationLog {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  templateCode: string;

  @Prop({ required: true, enum: ["email", "sms"] })
  channel: NotificationLogChannel;

  @Prop({ default: "" })
  recipientEmail: string;

  @Prop({ default: "" })
  recipientPhone: string;

  @Prop({ default: "" })
  recipientName: string;

  @Prop({ required: true, enum: ["invoice", "contract"] })
  contextType: NotificationLogContextType;

  @Prop({ required: true })
  contextId: string;

  @Prop({ default: "" })
  customerId: string;

  @Prop({ default: "" })
  invoiceId: string;

  @Prop({ default: "" })
  contractId: string;

  @Prop({ required: true, enum: ["sent", "failed"] })
  status: NotificationLogStatus;

  @Prop({ default: "" })
  errorMessage: string;

  @Prop({ default: "" })
  messageId: string; // Email/SMS provider'dan gelen message ID

  @Prop({ type: Object, default: {} })
  responseData: Record<string, unknown>;

  @Prop({ type: Object, default: {} })
  templateData: Record<string, unknown>; // Template'e gönderilen veriler

  @Prop({ default: "" })
  renderedSubject: string;

  @Prop({ default: "" })
  renderedBody: string;

  @Prop()
  sentAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationLogSchema =
  SchemaFactory.createForClass(NotificationLog);

// Indexes
NotificationLogSchema.index({ templateCode: 1 });
NotificationLogSchema.index({ channel: 1 });
NotificationLogSchema.index({ contextType: 1, contextId: 1 });
NotificationLogSchema.index({ status: 1 });
NotificationLogSchema.index({ customerId: 1 });
NotificationLogSchema.index({ invoiceId: 1 });
NotificationLogSchema.index({ contractId: 1 });
NotificationLogSchema.index({ sentAt: -1 });
NotificationLogSchema.index({ createdAt: -1 });
