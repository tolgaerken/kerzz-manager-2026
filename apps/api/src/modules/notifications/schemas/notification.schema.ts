import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NotificationDocument = Notification & Document;

export type NotificationType = "mention" | "reminder";

@Schema({ collection: "notifications", timestamps: true })
export class Notification {
  _id: Types.ObjectId;

  @Prop()
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ["mention", "reminder"] })
  type: NotificationType;

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

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index for fetching user's unread notifications efficiently
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
