import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ManagerLogService } from "../manager-log/manager-log.service";
import { ManagerNotificationService } from "../manager-notification/manager-notification.service";
import { CreateManagerNotificationDto } from "../manager-notification/dto";
import { SystemLogsService, SystemLogAction } from "../system-logs";

@Injectable()
export class ManagerLogReminderCron {
  constructor(
    private managerLogService: ManagerLogService,
    private managerNotificationService: ManagerNotificationService,
    private systemLogsService: SystemLogsService
  ) {}

  /**
   * Her 15 dakikada bir çalışır
   * Zamanı gelen hatırlatmaları kontrol eder ve bildirim oluşturur
   */
  @Cron("0 */15 * * * *") // Her 15 dakika
  async handlePendingReminders(): Promise<void> {
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
}
