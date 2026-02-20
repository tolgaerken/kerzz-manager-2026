import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  IsNumber,
  ArrayMinSize,
} from "class-validator";

export class UpdateNotificationSettingsDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  invoiceDueReminderDays?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  invoiceOverdueDays?: number[];

  @IsNumber()
  @IsOptional()
  invoiceLookbackDays?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @IsOptional()
  contractExpiryDays?: number[];

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "cronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  cronTime?: string;

  @IsBoolean()
  @IsOptional()
  cronEnabled?: boolean;

  // ── Fatura bildirim cron ──
  @IsBoolean()
  @IsOptional()
  invoiceNotificationCronEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "invoiceNotificationCronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  invoiceNotificationCronTime?: string;

  // ── Aylık kontrat bildirim cron ──
  @IsBoolean()
  @IsOptional()
  monthlyContractNotificationCronEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "monthlyContractNotificationCronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  monthlyContractNotificationCronTime?: string;

  // ── Yıllık kontrat bildirim cron ──
  @IsBoolean()
  @IsOptional()
  yearlyContractNotificationCronEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "yearlyContractNotificationCronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  yearlyContractNotificationCronTime?: string;

  // ── Kıst fatura cron ──
  @IsBoolean()
  @IsOptional()
  proratedInvoiceCronEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "proratedInvoiceCronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  proratedInvoiceCronTime?: string;

  // ── Hareketsiz pipeline cron ──
  @IsBoolean()
  @IsOptional()
  stalePipelineCronEnabled?: boolean;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "stalePipelineCronTime HH:mm formatında olmalıdır",
  })
  @IsOptional()
  stalePipelineCronTime?: string;

  // ── Manager log hatırlatma cron ──
  @IsBoolean()
  @IsOptional()
  managerLogReminderCronEnabled?: boolean;

  @IsString()
  @IsOptional()
  managerLogReminderCronExpression?: string;

  @IsBoolean()
  @IsOptional()
  dryRunMode?: boolean;

  // Ödeme başarılı olduğunda bildirim gönderilecek yönetici email adresleri
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentSuccessNotifyEmails?: string[];
}

export class NotificationSettingsResponseDto {
  _id: string;
  id: string;
  invoiceDueReminderDays: number[];
  invoiceOverdueDays: number[];
  invoiceLookbackDays: number;
  contractExpiryDays: number[];
  emailEnabled: boolean;
  smsEnabled: boolean;
  cronTime: string;
  cronEnabled: boolean;
  // Fatura bildirim cron
  invoiceNotificationCronEnabled: boolean;
  invoiceNotificationCronTime: string;
  // Aylık kontrat bildirim cron
  monthlyContractNotificationCronEnabled: boolean;
  monthlyContractNotificationCronTime: string;
  // Yıllık kontrat bildirim cron
  yearlyContractNotificationCronEnabled: boolean;
  yearlyContractNotificationCronTime: string;
  // Kıst fatura cron
  proratedInvoiceCronEnabled: boolean;
  proratedInvoiceCronTime: string;
  // Hareketsiz pipeline cron
  stalePipelineCronEnabled: boolean;
  stalePipelineCronTime: string;
  // Manager log hatırlatma cron
  managerLogReminderCronEnabled: boolean;
  managerLogReminderCronExpression: string;
  dryRunMode: boolean;
  // Ödeme başarılı bildirim email adresleri
  paymentSuccessNotifyEmails: string[];
  createdAt: Date;
  updatedAt: Date;
}
