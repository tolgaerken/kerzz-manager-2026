import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Contract,
  ContractDocument,
} from "../contracts/schemas/contract.schema";
import {
  Customer,
  CustomerDocument,
} from "../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { NotificationSettingsService } from "../notification-settings";
import {
  NotificationDispatchService,
  DispatchNotificationDto,
} from "../notification-dispatch";
import {
  buildContractTemplateData,
} from "../notification-queue/notification-data.helper";
import {
  SystemLogsService,
  SystemLogAction,
} from "../system-logs";

@Injectable()
export class ContractNotificationCron {
  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    private settingsService: NotificationSettingsService,
    private dispatchService: NotificationDispatchService,
    private systemLogsService: SystemLogsService
  ) {}

  /**
   * Her gün saat 09:30'da çalışır (fatura cron'undan sonra)
   * Kontrat bitiş tarihi yaklaşan bildirimleri gönderir
   */
  @Cron("0 30 9 * * *") // Her gün 09:30
  async handleContractNotifications(): Promise<void> {
    const startTime = Date.now();

    try {
      // Cron başlangıcını logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "contract-notification",
        { details: { message: "Kontrat bildirim cron'u başladı" } }
      );

      // Ayarları al
      const settings = await this.settingsService.getSettings();

      // Cron devre dışıysa çık
      if (!settings.cronEnabled) {
        console.log("⏸️ Kontrat bildirim cron'u devre dışı");
        return;
      }

      // En az bir kanal aktif olmalı
      if (!settings.emailEnabled && !settings.smsEnabled) {
        console.log("⚠️ Hiçbir bildirim kanalı aktif değil");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let totalSent = 0;
      let totalFailed = 0;

      // Her bir hatırlatma günü için kontratları işle
      for (const days of settings.contractExpiryDays) {
        const result = await this.processContractsExpiring(today, days, settings);
        totalSent += result.sent;
        totalFailed += result.failed;
      }

      const duration = Date.now() - startTime;

      // Cron bitişini logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_END,
        "contract-notification",
        {
          details: {
            message: "Kontrat bildirim cron'u tamamlandı",
            totalSent,
            totalFailed,
            duration,
          },
        }
      );

      console.log(
        `✅ Kontrat bildirim cron'u tamamlandı: ${totalSent} gönderildi, ${totalFailed} başarısız`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_FAILED,
        "contract-notification",
        {
          details: { error: errorMessage },
          errorMessage,
        }
      );

      console.error("❌ Kontrat bildirim cron'u başarısız:", errorMessage);
    }
  }

  /**
   * Bitiş tarihi N gün sonra olan kontratları işler
   */
  private async processContractsExpiring(
    today: Date,
    days: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    // N gün sonraki tarih
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Bitiş tarihi tam N gün sonra olan kontratlar
    // noEndDate === false (belirli bir bitiş tarihi var)
    // noNotification === false (bildirim açık)
    const contracts = await this.contractModel
      .find({
        endDate: { $gte: targetDate, $lt: nextDay },
        noEndDate: false,
        noNotification: false,
      })
      .lean()
      .exec();

    console.log(
      `📋 Bitiş tarihi ${days} gün sonra olan ${contracts.length} kontrat bulundu`
    );

    return this.sendNotificationsForContracts(contracts, days, settings);
  }

  /**
   * Kontratlar için bildirim gönderir
   */
  private async sendNotificationsForContracts(
    contracts: Contract[],
    remainingDays: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const contract of contracts) {
      try {
        // Müşteri bilgilerini al (Customer koleksiyonu id alanı üzerinden ilişkilendirilir)
        const customer = await this.customerModel
          .findOne({ id: contract.customerId })
          .lean()
          .exec();

        if (!customer) {
          console.warn(
            `⚠️ Müşteri bulunamadı: ${contract.customerId} (Kontrat: ${contract.contractId})`
          );
          failed++;
          continue;
        }

        // Template verileri hazırla
        const templateData = buildContractTemplateData(
          contract,
          customer,
          remainingDays
        );

        const notifications: DispatchNotificationDto[] = [];

        // Email bildirimi
        if (settings.emailEnabled && customer.email) {
          notifications.push({
            templateCode: "contract-expiry-email",
            channel: "email",
            recipient: {
              email: customer.email,
              name: customer.name,
            },
            contextType: "contract",
            contextId: contract.id,
            customerId: contract.customerId,
            contractId: contract.id,
            templateData,
          });
        }

        // SMS bildirimi
        if (settings.smsEnabled && customer.phone) {
          notifications.push({
            templateCode: "contract-expiry-sms",
            channel: "sms",
            recipient: {
              phone: customer.phone,
              name: customer.name,
            },
            contextType: "contract",
            contextId: contract.id,
            customerId: contract.customerId,
            contractId: contract.id,
            templateData,
          });
        }

        // Bildirimleri gönder
        const results = await this.dispatchService.dispatchBulk(notifications);

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        sent += successCount;
        failed += failCount;
      } catch (error) {
        console.error(
          `❌ Kontrat bildirimi gönderilemedi: ${contract.contractId}`,
          error
        );
        failed++;
      }
    }

    return { sent, failed };
  }
}
