import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  NotificationSettings,
  NotificationSettingsDocument,
} from "./schemas/notification-settings.schema";
import {
  UpdateNotificationSettingsDto,
  NotificationSettingsResponseDto,
} from "./dto";

const SINGLETON_ID = "default";

@Injectable()
export class NotificationSettingsService implements OnModuleInit {
  constructor(
    @InjectModel(NotificationSettings.name)
    private settingsModel: Model<NotificationSettingsDocument>
  ) {}

  async onModuleInit() {
    await this.ensureDefaultSettings();
  }

  /**
   * Varsayılan ayarları oluşturur (yoksa)
   */
  private async ensureDefaultSettings(): Promise<void> {
    const existing = await this.settingsModel
      .findOne({ id: SINGLETON_ID })
      .exec();

    if (!existing) {
      const settings = new this.settingsModel({
        id: SINGLETON_ID,
        invoiceDueReminderDays: [0],
        invoiceOverdueDays: [3, 5, 10],
        contractExpiryDays: [30, 15, 7],
        emailEnabled: true,
        smsEnabled: false,
        cronTime: "09:00",
        cronEnabled: true,
      });
      await settings.save();
      console.log("✅ Bildirim ayarları varsayılan değerlerle oluşturuldu");
    }
  }

  /**
   * Ayarları getirir
   */
  async getSettings(): Promise<NotificationSettingsResponseDto> {
    let settings = await this.settingsModel
      .findOne({ id: SINGLETON_ID })
      .exec();

    if (!settings) {
      await this.ensureDefaultSettings();
      settings = await this.settingsModel.findOne({ id: SINGLETON_ID }).exec();
    }

    return this.mapToResponseDto(settings!);
  }

  /**
   * Ayarları günceller
   */
  async updateSettings(
    dto: UpdateNotificationSettingsDto
  ): Promise<NotificationSettingsResponseDto> {
    const settings = await this.settingsModel
      .findOneAndUpdate({ id: SINGLETON_ID }, dto, { new: true })
      .exec();

    if (!settings) {
      await this.ensureDefaultSettings();
      return this.updateSettings(dto);
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Cron zamanını parse eder ve cron expression döndürür
   * "09:00" -> "0 9 * * *"
   */
  getCronExpression(cronTime: string): string {
    const [hour, minute] = cronTime.split(":").map(Number);
    return `${minute} ${hour} * * *`;
  }

  private mapToResponseDto(
    doc: NotificationSettingsDocument
  ): NotificationSettingsResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      invoiceDueReminderDays: doc.invoiceDueReminderDays,
      invoiceOverdueDays: doc.invoiceOverdueDays,
      invoiceLookbackDays: doc.invoiceLookbackDays ?? 30,
      contractExpiryDays: doc.contractExpiryDays,
      emailEnabled: doc.emailEnabled,
      smsEnabled: doc.smsEnabled,
      cronTime: doc.cronTime,
      cronEnabled: doc.cronEnabled,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
