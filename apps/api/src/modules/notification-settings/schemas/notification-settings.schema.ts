import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type NotificationSettingsDocument = NotificationSettings & Document;

@Schema({ collection: "notification-settings", timestamps: true })
export class NotificationSettings {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true, default: "default" })
  id: string; // Singleton ID

  // Fatura son ödeme günü hatırlatması (0 = vade günü)
  @Prop({ type: [Number], default: [0] })
  invoiceDueReminderDays: number[];

  // Fatura vadesi geçtikten sonra hatırlatma günleri
  @Prop({ type: [Number], default: [3, 5, 10] })
  invoiceOverdueDays: number[];

  // Kontrat bitiş öncesi hatırlatma günleri
  @Prop({ type: [Number], default: [30, 15, 7] })
  contractExpiryDays: number[];

  // E-posta bildirimi aktif mi
  @Prop({ default: true })
  emailEnabled: boolean;

  // SMS bildirimi aktif mi
  @Prop({ default: false })
  smsEnabled: boolean;

  // Cron çalışma saati (HH:mm formatında)
  @Prop({ default: "09:00" })
  cronTime: string;

  // Cron aktif mi
  @Prop({ default: true })
  cronEnabled: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSettingsSchema =
  SchemaFactory.createForClass(NotificationSettings);
