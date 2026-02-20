import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { NotificationSettingsService } from "../notification-settings";

export const CRON_JOB_NAMES = {
  INVOICE_NOTIFICATION: "invoice-notification",
  CONTRACT_NOTIFICATION_MONTHLY: "contract-notification-monthly",
  CONTRACT_NOTIFICATION_YEARLY: "contract-notification-yearly",
  STALE_PIPELINE: "stale-pipeline",
  PRORATED_INVOICE: "prorated-invoice",
  MANAGER_LOG_REMINDER: "manager-log-reminder",
} as const;

export type CronJobName = (typeof CRON_JOB_NAMES)[keyof typeof CRON_JOB_NAMES];

const DEFAULT_TIMEZONE = "Europe/Istanbul";

@Injectable()
export class CronSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(CronSchedulerService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private settingsService: NotificationSettingsService
  ) {}

  async onModuleInit() {
    // Ayarlar değiştiğinde replan tetiklenmesi için callback'i set et
    this.settingsService.setOnSettingsChangedCallback(
      this.replanAllFromSettings.bind(this)
    );

    // İlk başlatmada DB ayarlarına göre planla
    await this.replanAllFromSettings();
  }

  /**
   * Tüm cron job'ları DB ayarlarına göre yeniden planlar
   */
  async replanAllFromSettings(): Promise<void> {
    const settings = await this.settingsService.getSettings();

    this.replanJob(
      CRON_JOB_NAMES.INVOICE_NOTIFICATION,
      this.settingsService.timeToCronExpression(
        settings.invoiceNotificationCronTime
      )
    );

    this.replanJob(
      CRON_JOB_NAMES.CONTRACT_NOTIFICATION_MONTHLY,
      this.settingsService.timeToCronExpression(
        settings.monthlyContractNotificationCronTime
      )
    );

    this.replanJob(
      CRON_JOB_NAMES.CONTRACT_NOTIFICATION_YEARLY,
      this.settingsService.timeToCronExpression(
        settings.yearlyContractNotificationCronTime
      )
    );

    this.replanJob(
      CRON_JOB_NAMES.STALE_PIPELINE,
      this.settingsService.timeToCronExpression(settings.stalePipelineCronTime)
    );

    this.replanJob(
      CRON_JOB_NAMES.PRORATED_INVOICE,
      this.settingsService.timeToCronExpression(settings.proratedInvoiceCronTime)
    );

    this.replanJob(
      CRON_JOB_NAMES.MANAGER_LOG_REMINDER,
      settings.managerLogReminderCronExpression
    );

    this.logger.log("✅ Tüm cron job'lar DB ayarlarına göre yeniden planlandı");
  }

  /**
   * Tek bir cron job'ı yeni expression ile yeniden planlar
   */
  replanJob(jobName: CronJobName, cronExpression: string): void {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      if (!job) {
        this.logger.warn(`Cron job bulunamadı: ${jobName}`);
        return;
      }

      job.stop();

      const newJob = new CronJob(
        cronExpression,
        job.fireOnTick.bind(job),
        null,
        false,
        DEFAULT_TIMEZONE
      );

      this.schedulerRegistry.deleteCronJob(jobName);
      this.schedulerRegistry.addCronJob(jobName, newJob);
      newJob.start();

      this.logger.log(
        `🔄 Cron job yeniden planlandı: ${jobName} -> ${cronExpression}`
      );
    } catch (error) {
      this.logger.error(
        `Cron job yeniden planlanamadı: ${jobName}`,
        error instanceof Error ? error.message : error
      );
    }
  }

  /**
   * Belirli bir job'ın mevcut cron expression'ını döndürür
   */
  getJobExpression(jobName: CronJobName): string | null {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      if (!job) return null;
      const source = job.cronTime.source;
      return typeof source === "string" ? source : source.toISO() ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Tüm kayıtlı cron job'ların durumunu döndürür
   */
  getAllJobsStatus(): Record<
    string,
    { expression: string; running: boolean }
  > {
    const result: Record<string, { expression: string; running: boolean }> = {};

    for (const jobName of Object.values(CRON_JOB_NAMES)) {
      try {
        const job = this.schedulerRegistry.getCronJob(jobName);
        if (job) {
          const source = job.cronTime.source;
          const expression =
            typeof source === "string" ? source : source.toISO() ?? "";
          result[jobName] = {
            expression,
            running: (job as unknown as { running?: boolean }).running ?? false,
          };
        }
      } catch {
        // Job henüz kayıtlı değil
      }
    }

    return result;
  }
}
