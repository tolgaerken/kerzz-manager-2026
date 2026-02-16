import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type NotificationTemplateDocument = NotificationTemplate & Document & AuditFields;

export type NotificationChannel = "email" | "sms";

export type NotificationTemplateCode =
  | "invoice-due"
  | "invoice-overdue-3"
  | "invoice-overdue-5"
  | "invoice-overdue-10"
  | "contract-expiry";

@Schema({ collection: "notification-templates", timestamps: true })
export class NotificationTemplate {
  _id: Types.ObjectId;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true, enum: ["email", "sms"] })
  channel: NotificationChannel;

  @Prop({ default: "" })
  subject: string; // Email için konu (Handlebars destekli)

  @Prop({ required: true })
  body: string; // Handlebars template (HTML veya düz metin)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  variables: string[]; // Kullanılabilir değişkenler listesi

  @Prop()
  description: string; // Template açıklaması

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ code: 1 }, { unique: true });
NotificationTemplateSchema.index({ channel: 1 });
NotificationTemplateSchema.index({ isActive: 1 });
