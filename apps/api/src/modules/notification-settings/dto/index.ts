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

  @IsBoolean()
  @IsOptional()
  invoiceNotificationCronEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  contractNotificationCronEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  proratedInvoiceCronEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  stalePipelineCronEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  managerLogReminderCronEnabled?: boolean;
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
  invoiceNotificationCronEnabled: boolean;
  contractNotificationCronEnabled: boolean;
  proratedInvoiceCronEnabled: boolean;
  stalePipelineCronEnabled: boolean;
  managerLogReminderCronEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
