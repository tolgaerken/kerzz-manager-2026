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

type OnSettingsChangedCallback = () => Promise<void>;

@Injectable()
export class NotificationSettingsService implements OnModuleInit {
  private onSettingsChangedCallback: OnSettingsChangedCallback | null = null;

  constructor(
    @InjectModel(NotificationSettings.name)
    private settingsModel: Model<NotificationSettingsDocument>
  ) {}

  /**
   * Ayarlar değiştiğinde çağrılacak callback'i set eder
   * CronSchedulerService tarafından kullanılır
   */
  setOnSettingsChangedCallback(callback: OnSettingsChangedCallback): void {
    this.onSettingsChangedCallback = callback;
  }

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
        // Job-bazlı enable/disable
        invoiceNotificationCronEnabled: true,
        contractNotificationCronEnabled: true,
        proratedInvoiceCronEnabled: true,
        stalePipelineCronEnabled: true,
        managerLogReminderCronEnabled: true,
        // Job-bazlı zamanlama
        invoiceNotificationCronTime: "09:00",
        contractNotificationCronTime: "09:30",
        proratedInvoiceCronTime: "09:00",
        stalePipelineCronTime: "09:15",
        managerLogReminderCronExpression: "0 */15 * * * *",
        dryRunMode: false,
      });
      await settings.save();
      console.log("✅ Bildirim ayarları varsayılan değerlerle oluşturuldu");
    } else {
      // Mevcut kayıtta yeni alanlar eksikse backfill yap
      await this.backfillNewFields(existing);
    }
  }

  /**
   * Eski kayıtlarda eksik olan yeni alanları varsayılan değerlerle doldurur
   */
  private async backfillNewFields(
    doc: NotificationSettingsDocument
  ): Promise<void> {
    const updates: Record<string, string> = {};

    if (!doc.invoiceNotificationCronTime) {
      updates.invoiceNotificationCronTime = doc.cronTime || "09:00";
    }
    if (!doc.contractNotificationCronTime) {
      updates.contractNotificationCronTime = "09:30";
    }
    if (!doc.proratedInvoiceCronTime) {
      updates.proratedInvoiceCronTime = doc.cronTime || "09:00";
    }
    if (!doc.stalePipelineCronTime) {
      updates.stalePipelineCronTime = "09:15";
    }
    if (!doc.managerLogReminderCronExpression) {
      updates.managerLogReminderCronExpression = "0 */15 * * * *";
    }

    if (Object.keys(updates).length > 0) {
      await this.settingsModel.updateOne({ id: SINGLETON_ID }, { $set: updates });
      console.log("✅ Bildirim ayarları yeni alanlarla güncellendi:", Object.keys(updates));
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
   * Ayarları günceller ve cron job'ları yeniden planlar
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

    // Cron zamanlamaları değiştiyse replan tetikle
    if (this.onSettingsChangedCallback) {
      try {
        await this.onSettingsChangedCallback();
      } catch (error) {
        console.error("Cron replan hatası:", error);
      }
    }

    return this.mapToResponseDto(settings);
  }

  /**
   * Cron zamanını parse eder ve cron expression döndürür (deprecated, timeToCronExpression kullanın)
   * "09:00" -> "0 9 * * *"
   */
  getCronExpression(cronTime: string): string {
    return this.timeToCronExpression(cronTime);
  }

  /**
   * HH:mm formatını cron expression'a çevirir
   * "09:00" -> "0 9 * * *"
   */
  timeToCronExpression(time: string): string {
    const [hour, minute] = time.split(":").map(Number);
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
      // Job-bazlı enable/disable
      invoiceNotificationCronEnabled: doc.invoiceNotificationCronEnabled ?? true,
      contractNotificationCronEnabled:
        doc.contractNotificationCronEnabled ?? true,
      proratedInvoiceCronEnabled: doc.proratedInvoiceCronEnabled ?? true,
      stalePipelineCronEnabled: doc.stalePipelineCronEnabled ?? true,
      managerLogReminderCronEnabled: doc.managerLogReminderCronEnabled ?? true,
      // Job-bazlı zamanlama (backfill ile fallback)
      invoiceNotificationCronTime:
        doc.invoiceNotificationCronTime ?? doc.cronTime ?? "09:00",
      contractNotificationCronTime:
        doc.contractNotificationCronTime ?? "09:30",
      proratedInvoiceCronTime:
        doc.proratedInvoiceCronTime ?? doc.cronTime ?? "09:00",
      stalePipelineCronTime: doc.stalePipelineCronTime ?? "09:15",
      managerLogReminderCronExpression:
        doc.managerLogReminderCronExpression ?? "0 */15 * * * *",
      dryRunMode: doc.dryRunMode ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
