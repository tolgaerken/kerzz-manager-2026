import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ManagerLogService } from "../manager-log/manager-log.service";
import { ManagerNotificationService } from "../manager-notification/manager-notification.service";
import { CreateManagerNotificationDto } from "../manager-notification/dto";
import { SystemLogsService, SystemLogAction } from "../system-logs";
import { NotificationSettingsService } from "../notification-settings";
import type { ManagerLogReminderDryRunResponse } from "./dto/dry-run.dto";
import type { CronManualRunResponseDto } from "./dto/manual-run.dto";

@Injectable()
export class ManagerLogReminderCron {
  private readonly logger = new Logger(ManagerLogReminderCron.name);

  constructor(
    private managerLogService: ManagerLogService,
    private managerNotificationService: ManagerNotificationService,
    private systemLogsService: SystemLogsService,
    private settingsService: NotificationSettingsService
  ) {}

  /**
   * Her 15 dakikada bir çalışır
   * Zamanı gelen hatırlatmaları kontrol eder ve bildirim oluşturur
   */
  @Cron("0 */15 * * * *") // Her 15 dakika
  async handlePendingReminders(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    if (!settings.managerLogReminderCronEnabled) {
      return; // Sessizce çık — 15 dakikada bir çalıştığı için log spam'i önle
    }

    if (settings.dryRunMode) {
      // Dry run modunda bekleyen hatırlatmaları logla, gerçek işlem yapma
      const pendingReminders = await this.managerLogService.getPendingReminders(new Date());
      if (pendingReminders.length > 0) {
        this.logger.log(
          `🧪 [DRY RUN] ${pendingReminders.length} hatırlatma işlenecekti — kuru çalışma modunda atlandı`
        );
        for (const log of pendingReminders) {
          this.logger.log(`🧪 [DRY RUN] LogId: ${log._id} → userId: ${log.authorId} — ${log.message}`);
        }
      }
      return;
    }

    const startTime = Date.now();

    try {
      // Cron başlangıcını logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "manager-log-reminder",
        { details: { message: "Manager log hatırlatma cron'u başladı" } }
      );

      // Zamanı gelen hatırlatmaları bul
      const pendingReminders = await this.managerLogService.getPendingReminders(
        new Date()
      );

      if (pendingReminders.length === 0) {
        console.log("📭 Bekleyen hatırlatma yok");
        return;
      }

      console.log(`📬 ${pendingReminders.length} bekleyen hatırlatma bulundu`);

      let successCount = 0;
      let failCount = 0;

      // Her hatırlatma için bildirim oluştur
      for (const log of pendingReminders) {
        try {
          await this.processReminder(log);
          successCount++;
        } catch (error) {
          console.error(
            `❌ Hatırlatma işlenemedi: ${log._id}`,
            error instanceof Error ? error.message : error
          );
          failCount++;
        }
      }

      const duration = Date.now() - startTime;

      // Cron bitişini logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_END,
        "manager-log-reminder",
        {
          details: {
            message: "Manager log hatırlatma cron'u tamamlandı",
            totalProcessed: pendingReminders.length,
            successCount,
            failCount,
            duration,
          },
        }
      );

      console.log(
        `✅ Hatırlatma cron'u tamamlandı: ${successCount} başarılı, ${failCount} başarısız`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_FAILED,
        "manager-log-reminder",
        {
          details: { error: errorMessage },
          errorMessage,
        }
      );

      console.error("❌ Hatırlatma cron'u başarısız:", errorMessage);
    }
  }

  /**
   * Tek bir hatırlatmayı işler: bildirim oluşturur ve tamamlandı olarak işaretler
   */
  private async processReminder(log: {
    _id: string;
    id: string;
    customerId: string;
    contextType: string;
    contextId: string;
    message: string;
    authorId: string;
    pipelineRef?: string;
  }): Promise<void> {
    // Bildirim oluştur (hatırlatmayı oluşturan kullanıcıya)
    const notification: CreateManagerNotificationDto = {
      userId: log.authorId,
      type: "reminder",
      logId: log._id,
      customerId: log.customerId,
      contextType: log.contextType,
      contextId: log.contextId,
      message: this.truncateMessage(log.message, 100),
      pipelineRef: log.pipelineRef,
    };

    await this.managerNotificationService.create(notification);

    // Hatırlatmayı tamamlandı olarak işaretle
    await this.managerLogService.markReminderCompleted(log._id);

    console.log(`🔔 Hatırlatma bildirimi oluşturuldu: ${log._id}`);
  }

  /**
   * Mesajı belirtilen uzunlukta keser
   */
  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  }

  /**
   * Dry run: Gercek bildirim olusturmadan ne olacagini raporlar
   */
  async dryRun(): Promise<ManagerLogReminderDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const pendingReminders = await this.managerLogService.getPendingReminders(
      new Date()
    );

    const items = pendingReminders.map((log) => ({
      logId: log._id,
      authorId: log.authorId,
      customerId: log.customerId,
      contextType: log.contextType,
      contextId: log.contextId,
      message: this.truncateMessage(log.message, 100),
      pipelineRef: log.pipelineRef,
    }));

    return {
      cronName: "manager-log-reminder",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        managerLogReminderCronEnabled: settings.managerLogReminderCronEnabled,
      },
      summary: {
        totalPendingReminders: items.length,
      },
      items,
    };
  }

  async manualRun(target: { logId: string }): Promise<CronManualRunResponseDto> {
    const startTime = Date.now();
    const executedAt = new Date().toISOString();

    try {
      const settings = await this.settingsService.getSettings();
      if (!settings.managerLogReminderCronEnabled) {
        return {
          cronName: "manager-log-reminder",
          success: true,
          skipped: true,
          message: "Manager log reminder cron'u devre disi oldugu icin islem atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      const log = await this.managerLogService.findOne(target.logId);
      if (!log) {
        return {
          cronName: "manager-log-reminder",
          success: false,
          skipped: false,
          message: `Log bulunamadi: ${target.logId}`,
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      if (!log.reminder) {
        return {
          cronName: "manager-log-reminder",
          success: true,
          skipped: true,
          message: "Log icin reminder tanimi olmadigindan islem atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      if (log.reminder.completed) {
        return {
          cronName: "manager-log-reminder",
          success: true,
          skipped: true,
          message: "Reminder zaten tamamlanmis",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      if (log.reminder.date > new Date()) {
        return {
          cronName: "manager-log-reminder",
          success: true,
          skipped: true,
          message: "Reminder zamani henuz gelmedigi icin islem atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            reminderDate: log.reminder.date.toISOString(),
          },
        };
      }

      if (settings.dryRunMode) {
        return {
          cronName: "manager-log-reminder",
          success: true,
          skipped: true,
          message: "Dry run modu acik oldugu icin reminder bildirimi olusturulmadi",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            logId: log._id,
            authorId: log.authorId,
          },
        };
      }

      await this.processReminder({
        _id: log._id,
        id: log.id,
        customerId: log.customerId,
        contextType: log.contextType,
        contextId: log.contextId,
        message: log.message,
        authorId: log.authorId,
        pipelineRef: log.pipelineRef,
      });

      return {
        cronName: "manager-log-reminder",
        success: true,
        skipped: false,
        message: "Reminder bildirimi olusturuldu ve reminder tamamlandi",
        executedAt,
        durationMs: Date.now() - startTime,
        details: {
          logId: log._id,
          authorId: log.authorId,
        },
      };
    } catch (error) {
      return {
        cronName: "manager-log-reminder",
        success: false,
        skipped: false,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
        executedAt,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
