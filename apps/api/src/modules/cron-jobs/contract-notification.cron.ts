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
import {
  calculateRemainingDays,
  getMonthBoundaries,
} from "../contracts/utils/contract-date.utils";
import type {
  ContractNotificationDryRunResponse,
  ContractDryRunItem,
  DryRunNotificationItem,
} from "./dto/dry-run.dto";
import { formatDate } from "../notification-queue/notification-data.helper";

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
      // Ayarları al
      const settings = await this.settingsService.getSettings();

      // Cron devre dışıysa çık
      if (!settings.cronEnabled || !settings.contractNotificationCronEnabled) {
        console.log("⏸️ Kontrat bildirim cron'u devre dışı");
        return;
      }

      // En az bir kanal aktif olmalı
      if (!settings.emailEnabled && !settings.smsEnabled) {
        console.log("⚠️ Hiçbir bildirim kanalı aktif değil");
        return;
      }

      if (settings.dryRunMode) {
        console.log("🧪 [DRY RUN] Kontrat bildirim cron'u kuru çalışma modunda — gerçek gönderim yapılmayacak");
      }

      // Cron başlangıcını logla (ayar kontrolleri geçtikten sonra)
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "contract-notification",
        { details: { message: "Kontrat bildirim cron'u başladı" } }
      );

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
   * Bitiş tarihi N gün sonrasının ayına denk gelen kontratları işler
   */
  private async processContractsExpiring(
    today: Date,
    days: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    // N gün sonraki tarih
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const { monthStart, monthEnd } = getMonthBoundaries(targetDate);

    // Bitiş tarihi hedef ayin icinde olan kontratlar
    // noEndDate === false (belirli bir bitiş tarihi var)
    // noNotification === false (bildirim açık)
    // lastNotify bugün değil (bugün zaten bildirim gönderilmemiş)
    const contracts = await this.contractModel
      .find({
        endDate: { $gte: monthStart, $lte: monthEnd },
        noEndDate: false,
        noNotification: false,
        $or: [
          { lastNotify: { $exists: false } },
          { lastNotify: null },
          { lastNotify: { $lt: today } },
        ],
      })
      .lean()
      .exec();

    console.log(
      `📋 Bitiş tarihi hedef ayda olan ${contracts.length} kontrat bulundu`
    );

    return this.sendNotificationsForContracts(contracts, today, settings);
  }

  /**
   * Kontratlar için bildirim gönderir
   */
  private async sendNotificationsForContracts(
    contracts: Contract[],
    referenceDate: Date,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const contract of contracts) {
      try {
        const endDate = contract.endDate ? new Date(contract.endDate) : null;
        const remainingDays = calculateRemainingDays(endDate, referenceDate);

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

        // DRY RUN MODU: Gerçek gönderim yapma, sadece logla
        if (settings.dryRunMode) {
          const channels: string[] = [];
          if (settings.emailEnabled && customer.email) channels.push(`email(${customer.email})`);
          if (settings.smsEnabled && customer.phone) channels.push(`sms(${customer.phone})`);
          console.log(
            `🧪 [DRY RUN] Kontrat bildirimi atlanıyor — Kontrat: ${contract.contractId}, Müşteri: ${customer.name}, Kanallar: ${channels.join(", ") || "yok"}`
          );
          sent += channels.length;
          continue;
        }

        // Bildirimleri gönder
        const results = await this.dispatchService.dispatchBulk(notifications);

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        sent += successCount;
        failed += failCount;

        // Başarılı gönderim sonrası lastNotify güncelle (tekrar gönderimi önler)
        if (successCount > 0) {
          await this.contractModel.updateOne(
            { _id: contract._id },
            { $set: { lastNotify: new Date() } }
          );
        }
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

  /**
   * Dry run: Gercek bildirim gondermeden ne olacagini raporlar
   */
  async dryRun(): Promise<ContractNotificationDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items: ContractDryRunItem[] = [];
    let emailCount = 0;
    let smsCount = 0;

    for (const days of settings.contractExpiryDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const { monthStart, monthEnd } = getMonthBoundaries(targetDate);

      const contracts = await this.contractModel
        .find({
          endDate: { $gte: monthStart, $lte: monthEnd },
          noEndDate: false,
          noNotification: false,
        })
        .lean()
        .exec();

      for (const contract of contracts) {
        const endDate = contract.endDate ? new Date(contract.endDate) : null;
        const remainingDays = calculateRemainingDays(endDate, today);

        const customer = await this.customerModel
          .findOne({ id: contract.customerId })
          .lean()
          .exec();

        if (!customer) {
          items.push({
            contractId: contract.contractId || contract.id,
            company: contract.company || "",
            customerId: contract.customerId || "",
            customerName: "",
            endDate: endDate ? formatDate(endDate) : "",
            remainingDays,
            notifications: [],
            skippedReason: `Musteri bulunamadi: ${contract.customerId}`,
          });
          continue;
        }

        const templateData = buildContractTemplateData(contract, customer, remainingDays);
        const notifications: DryRunNotificationItem[] = [];

        if (settings.emailEnabled && customer.email) {
          notifications.push({
            templateCode: "contract-expiry-email",
            channel: "email",
            recipient: { email: customer.email, name: customer.name },
            contextType: "contract",
            contextId: contract.id,
            customerId: contract.customerId,
            templateData,
          });
          emailCount++;
        }

        if (settings.smsEnabled && customer.phone) {
          notifications.push({
            templateCode: "contract-expiry-sms",
            channel: "sms",
            recipient: { phone: customer.phone, name: customer.name },
            contextType: "contract",
            contextId: contract.id,
            customerId: contract.customerId,
            templateData,
          });
          smsCount++;
        }

        items.push({
          contractId: contract.contractId || contract.id,
          company: contract.company || "",
          customerId: contract.customerId || "",
          customerName: customer.name || customer.brand || "",
          endDate: endDate ? formatDate(endDate) : "",
          remainingDays,
          notifications,
        });
      }
    }

    return {
      cronName: "contract-notification",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        contractNotificationCronEnabled: settings.contractNotificationCronEnabled,
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        contractExpiryDays: settings.contractExpiryDays,
      },
      summary: {
        totalContracts: items.length,
        totalNotificationsWouldSend: emailCount + smsCount,
        byChannel: { email: emailCount, sms: smsCount },
      },
      items,
    };
  }
}
