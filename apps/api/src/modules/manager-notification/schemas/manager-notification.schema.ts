import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type ManagerNotificationDocument = ManagerNotification & Document & AuditFields;

export type ManagerNotificationType = "mention" | "reminder" | "stale";

@Schema({ collection: "manager-notifications", timestamps: true })
export class ManagerNotification {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ["mention", "reminder", "stale"] })
  type: ManagerNotificationType;

  @Prop({ required: true })
  logId: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  contextType: string;

  @Prop({ required: true })
  contextId: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String })
  pipelineRef?: string;

  @Prop({ type: String })
  customerName?: string;

  @Prop({ type: String })
  contextLabel?: string;

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ManagerNotificationSchema = SchemaFactory.createForClass(ManagerNotification);

// Index for fetching user's unread notifications efficiently
ManagerNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
