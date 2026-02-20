import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import type { AuditFields } from "../../../common/audit";

export type NotificationSettingsDocument = NotificationSettings & Document & AuditFields;

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

  // Ödenmemiş faturalar için geriye dönük maksimum tarama günü (varsayılan: 90)
  @Prop({ type: Number, default: 90 })
  invoiceLookbackDays: number;

  // Kontrat bitiş öncesi hatırlatma günleri
  @Prop({ type: [Number], default: [30, 15, 7] })
  contractExpiryDays: number[];

  // E-posta bildirimi aktif mi
  @Prop({ default: true })
  emailEnabled: boolean;

  // SMS bildirimi aktif mi
  @Prop({ default: false })
  smsEnabled: boolean;

  // Eski genel cron saati (deprecated — geriye uyumluluk için tutuldu)
  @Prop({ default: "09:00" })
  cronTime: string;

  // Genel cron aktif mi (eski alan — geriye uyumluluk)
  @Prop({ default: true })
  cronEnabled: boolean;

  // ── Her cron job için ayrı enable/disable ve zamanlama ──

  // Fatura bildirim cron'u
  @Prop({ default: true })
  invoiceNotificationCronEnabled: boolean;

  @Prop({ default: "09:00" })
  invoiceNotificationCronTime: string; // HH:mm formatı

  // Aylık kontrat bildirim cron'u
  @Prop({ default: true })
  monthlyContractNotificationCronEnabled: boolean;

  @Prop({ default: "09:30" })
  monthlyContractNotificationCronTime: string; // HH:mm formatı

  // Yıllık kontrat bildirim cron'u
  @Prop({ default: true })
  yearlyContractNotificationCronEnabled: boolean;

  @Prop({ default: "09:30" })
  yearlyContractNotificationCronTime: string; // HH:mm formatı

  // Eski kontrat bildirim alanları (deprecated — geriye uyumluluk için tutuldu)
  @Prop({ default: true })
  contractNotificationCronEnabled: boolean;

  @Prop({ default: "09:30" })
  contractNotificationCronTime: string; // HH:mm formatı

  // Kıst fatura cron'u
  @Prop({ default: true })
  proratedInvoiceCronEnabled: boolean;

  @Prop({ default: "09:00" })
  proratedInvoiceCronTime: string; // HH:mm formatı

  // Hareketsiz pipeline cron'u
  @Prop({ default: true })
  stalePipelineCronEnabled: boolean;

  @Prop({ default: "09:15" })
  stalePipelineCronTime: string; // HH:mm formatı

  // Manager log hatırlatma cron'u
  @Prop({ default: true })
  managerLogReminderCronEnabled: boolean;

  @Prop({ default: "0 */15 * * * *" })
  managerLogReminderCronExpression: string; // Tam cron expression

  // Kuru çalışma modu: true iken cron'lar gerçek işlem yapmaz, sadece log atar
  @Prop({ default: false })
  dryRunMode: boolean;

  // Ödeme başarılı olduğunda bildirim gönderilecek yönetici email adresleri
  @Prop({ type: [String], default: [] })
  paymentSuccessNotifyEmails: string[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const NotificationSettingsSchema =
  SchemaFactory.createForClass(NotificationSettings);
