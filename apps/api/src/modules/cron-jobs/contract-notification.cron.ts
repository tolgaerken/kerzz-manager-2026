import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { CRON_JOB_NAMES } from "./cron-scheduler.service";
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
  buildContractRenewalTemplateData,
  ContractRenewalData,
  formatDate,
} from "../notification-queue/notification-data.helper";
import { SystemLogsService, SystemLogAction, SystemLogCategory, SystemLogStatus } from "../system-logs";
import { ManagerLogService } from "../manager-log/manager-log.service";
import { EmailService } from "../email/email.service";
import {
  calculateRemainingDays,
  getMonthBoundaries,
} from "../contracts/utils/contract-date.utils";
import type {
  ContractNotificationDryRunResponse,
  ContractDryRunItem,
  DryRunNotificationItem,
} from "./dto/dry-run.dto";
import {
  AnnualContractRenewalPricingService,
  RenewalPricingResult,
} from "./services";
import { ContractPaymentLinkHelper } from "./services/contract-payment-link.helper";

type MilestoneType =
  | "pre-expiry"
  | "post-1"
  | "post-3"
  | "post-5"
  | "termination";

interface MilestoneConfig {
  milestone: MilestoneType;
  daysFromExpiry: number;
  templateCode: string;
}

const YEARLY_CONTRACT_MILESTONES: MilestoneConfig[] = [
  { milestone: "post-5", daysFromExpiry: -5, templateCode: "contract-renewal-overdue-5-email" },
  { milestone: "post-3", daysFromExpiry: -3, templateCode: "contract-renewal-overdue-3-email" },
  { milestone: "post-1", daysFromExpiry: -1, templateCode: "contract-renewal-overdue-1-email" },
];

const TERMINATION_DAY = 6;

@Injectable()
export class ContractNotificationCron {
  private readonly logger = new Logger(ContractNotificationCron.name);

  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    private settingsService: NotificationSettingsService,
    private dispatchService: NotificationDispatchService,
    private systemLogsService: SystemLogsService,
    private renewalPricingService: AnnualContractRenewalPricingService,
    private paymentLinkHelper: ContractPaymentLinkHelper,
    private managerLogService: ManagerLogService,
    private emailService: EmailService
  ) {}

  /**
   * Aylık kontrat bildirimleri için cron handler.
   */
  @Cron("30 9 * * *", {
    name: CRON_JOB_NAMES.CONTRACT_NOTIFICATION_MONTHLY,
    timeZone: "Europe/Istanbul",
  })
  async handleMonthlyContractNotifications(): Promise<void> {
    const startTime = Date.now();

    try {
      const settings = await this.settingsService.getSettings();

      if (
        !settings.cronEnabled ||
        !settings.monthlyContractNotificationCronEnabled
      ) {
        this.logger.log("Aylık kontrat bildirim cron'u devre dışı");
        return;
      }

      if (!settings.emailEnabled && !settings.smsEnabled) {
        this.logger.warn("Hiçbir bildirim kanalı aktif değil");
        return;
      }

      if (settings.dryRunMode) {
        this.logger.log(
          "[DRY RUN] Aylık kontrat bildirim cron'u kuru çalışma modunda"
        );
      }

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "contract-notification-monthly",
        { details: { message: "Aylık kontrat bildirim cron'u başladı" } }
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let totalSent = 0;
      let totalFailed = 0;

      for (const days of settings.contractExpiryDays) {
        const result = await this.processContractsExpiring(today, days, settings);
        totalSent += result.sent;
        totalFailed += result.failed;
      }

      const duration = Date.now() - startTime;

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_END,
        "contract-notification-monthly",
        {
          details: {
            message: "Aylık kontrat bildirim cron'u tamamlandı",
            totalSent,
            totalFailed,
            duration,
          },
        }
      );

      this.logger.log(
        `Aylık kontrat bildirim cron'u tamamlandı: ${totalSent} gönderildi, ${totalFailed} başarısız`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_FAILED,
        "contract-notification-monthly",
        {
          details: { error: errorMessage },
          errorMessage,
        }
      );

      this.logger.error(
        `Aylık kontrat bildirim cron'u başarısız: ${errorMessage}`
      );
    }
  }

  /**
   * Yıllık kontrat bildirimleri için cron handler.
   */
  @Cron("30 9 * * *", {
    name: CRON_JOB_NAMES.CONTRACT_NOTIFICATION_YEARLY,
    timeZone: "Europe/Istanbul",
  })
  async handleYearlyContractNotifications(): Promise<void> {
    const startTime = Date.now();

    try {
      const settings = await this.settingsService.getSettings();

      if (
        !settings.cronEnabled ||
        !settings.yearlyContractNotificationCronEnabled
      ) {
        this.logger.log("Yıllık kontrat bildirim cron'u devre dışı");
        return;
      }

      if (!settings.emailEnabled && !settings.smsEnabled) {
        this.logger.warn("Hiçbir bildirim kanalı aktif değil");
        return;
      }

      if (settings.dryRunMode) {
        this.logger.log(
          "[DRY RUN] Yıllık kontrat bildirim cron'u kuru çalışma modunda"
        );
      }

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "contract-notification-yearly",
        { details: { message: "Yıllık kontrat bildirim cron'u başladı" } }
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yearlyResult = await this.processYearlyContractRenewals(
        today,
        settings
      );

      const duration = Date.now() - startTime;

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_END,
        "contract-notification-yearly",
        {
          details: {
            message: "Yıllık kontrat bildirim cron'u tamamlandı",
            totalSent: yearlyResult.sent,
            totalFailed: yearlyResult.failed,
            duration,
          },
        }
      );

      this.logger.log(
        `Yıllık kontrat bildirim cron'u tamamlandı: ${yearlyResult.sent} gönderildi, ${yearlyResult.failed} başarısız`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_FAILED,
        "contract-notification-yearly",
        {
          details: { error: errorMessage },
          errorMessage,
        }
      );

      this.logger.error(
        `Yıllık kontrat bildirim cron'u başarısız: ${errorMessage}`
      );
    }
  }

  /**
   * Yıllık kontratlar için yenileme bildirimi akışı.
   * Pre-expiry ve post-expiry milestone'larını işler.
   */
  private async processYearlyContractRenewals(
    today: Date,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Pre-expiry: contractExpiryDays ayarlarındaki günler için
    for (const days of settings.contractExpiryDays) {
      const result = await this.processYearlyPreExpiry(today, days, settings);
      sent += result.sent;
      failed += result.failed;
    }

    // Post-expiry milestones: +1, +3, +5 gün
    for (const milestoneConfig of YEARLY_CONTRACT_MILESTONES) {
      const result = await this.processYearlyPostExpiry(
        today,
        milestoneConfig,
        settings
      );
      sent += result.sent;
      failed += result.failed;
    }

    // Termination check: +6 gün (mock)
    await this.processTerminationCheck(today, settings);

    return { sent, failed };
  }

  /**
   * Yıllık kontratlar için bitiş öncesi (pre-expiry) bildirimleri.
   */
  private async processYearlyPreExpiry(
    today: Date,
    daysBeforeExpiry: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    const contracts = await this.contractModel
      .find({
        yearly: true,
        isActive: true,
        noEndDate: false,
        noNotification: false,
        endDate: { $gte: targetDateStart, $lte: targetDateEnd },
      })
      .lean()
      .exec();

    this.logger.log(
      `Yıllık pre-expiry (${daysBeforeExpiry} gün): ${contracts.length} kontrat bulundu`
    );

    return this.sendYearlyRenewalNotifications(
      contracts,
      today,
      "pre-expiry",
      daysBeforeExpiry,
      "contract-renewal-pre-expiry-email",
      settings
    );
  }

  /**
   * Yıllık kontratlar için bitiş sonrası (post-expiry) bildirimleri.
   */
  private async processYearlyPostExpiry(
    today: Date,
    milestoneConfig: MilestoneConfig,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + milestoneConfig.daysFromExpiry);

    const targetDateStart = new Date(targetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    const contracts = await this.contractModel
      .find({
        yearly: true,
        isActive: true,
        noEndDate: false,
        noNotification: false,
        endDate: { $gte: targetDateStart, $lte: targetDateEnd },
      })
      .lean()
      .exec();

    this.logger.log(
      `Yıllık ${milestoneConfig.milestone}: ${contracts.length} kontrat bulundu`
    );

    return this.sendYearlyRenewalNotifications(
      contracts,
      today,
      milestoneConfig.milestone,
      milestoneConfig.daysFromExpiry,
      milestoneConfig.templateCode,
      settings
    );
  }

  /**
   * Yıllık kontrat yenileme bildirimleri gönderir.
   */
  private async sendYearlyRenewalNotifications(
    contracts: Contract[],
    today: Date,
    milestone: MilestoneType,
    daysFromExpiry: number,
    templateCode: string,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    let skippedDuplicate = 0;

    const contractIds = contracts.map((c) => c.id).filter(Boolean);
    const cycleKeys = contracts.map((c) =>
      this.generateCycleKey(c.endDate ? new Date(c.endDate) : new Date())
    );
    const uniqueCycleKey = cycleKeys[0] || this.generateCycleKey(new Date());

    const sentConditionsMap =
      await this.dispatchService.getDistinctTemplateCodesForContractCycles(
        contractIds,
        uniqueCycleKey
      );

    const results = await Promise.allSettled(
      contracts.map(async (contract) => {
        try {
          const cycleKey = this.generateCycleKey(
            contract.endDate ? new Date(contract.endDate) : new Date()
          );
          const mapKey = `${contract.id}:${cycleKey}`;
          const sentTemplates = sentConditionsMap.get(mapKey) ?? [];

          if (sentTemplates.includes(templateCode)) {
            this.logger.debug(
              `Kontrat ${contract.contractId} için ${templateCode} zaten gönderilmiş (cycle: ${cycleKey})`
            );
            return { status: "skipped-duplicate" as const };
          }

          const customer = await this.customerModel
            .findOne({ id: contract.customerId })
            .lean()
            .exec();

          if (!customer) {
            this.logger.warn(
              `Müşteri bulunamadı: ${contract.customerId} (Kontrat: ${contract.contractId})`
            );
            return { status: "failed" as const, reason: "customer-not-found" };
          }

          if (settings.dryRunMode) {
            this.logger.log(
              `[DRY RUN] Yıllık kontrat bildirimi: ${contract.contractId}, Milestone: ${milestone}`
            );
            return { status: "dry-run" as const };
          }

          const pricingResult = await this.renewalPricingService.calculateRenewalPrice(
            contract.id
          );

          const paymentLinkResult = await this.paymentLinkHelper.createRenewalPaymentLink(
            contract,
            customer,
            pricingResult.newTotalTL
          );

          const renewalData: ContractRenewalData = {
            paymentLink: paymentLinkResult.url,
            renewalAmount: pricingResult.newTotalTL,
            oldAmount: pricingResult.oldTotalTL,
            increaseRateInfo: this.formatIncreaseRateInfo(pricingResult),
            daysFromExpiry: Math.abs(daysFromExpiry),
            terminationDate: this.calculateTerminationDate(contract.endDate),
            milestone,
          };

          const templateData = buildContractRenewalTemplateData(
            contract,
            customer,
            renewalData,
            "cron"
          );

          const notifications: DispatchNotificationDto[] = [];

          if (settings.emailEnabled && customer.email) {
            notifications.push({
              templateCode,
              channel: "email",
              recipient: {
                email: customer.email,
                name: customer.name,
              },
              contextType: "contract",
              contextId: contract.id,
              customerId: contract.customerId,
              contractId: contract.id,
              renewalCycleKey: cycleKey,
              templateData,
            });
          }

          if (notifications.length === 0) {
            return { status: "no-channel" as const };
          }

          const dispatchResults = await this.dispatchService.dispatchBulk(notifications);
          const successCount = dispatchResults.filter((r) => r.success).length;
          const failCount = dispatchResults.filter((r) => !r.success).length;

          // System log: Bildirim gönderim sonucu
          const logAction = successCount > 0
            ? SystemLogAction.CONTRACT_NOTIFICATION_SENT
            : SystemLogAction.CONTRACT_NOTIFICATION_FAILED;
          const logStatus = successCount > 0
            ? SystemLogStatus.SUCCESS
            : SystemLogStatus.FAILURE;

          await this.systemLogsService
            .log(SystemLogCategory.CRON, logAction, "contract-notification", {
              entityId: contract.contractId || contract.id,
              entityType: "Contract",
              status: logStatus,
              details: {
                customerId: contract.customerId,
                customerName: customer.name,
                contractId: contract.contractId,
                milestone,
                templateCode,
                successCount,
                failCount,
                message: successCount > 0
                  ? `${contract.contractId} nolu kontrat için ${milestone} bildirimi gönderildi`
                  : `${contract.contractId} nolu kontrat için bildirim gönderilemedi`,
              },
            })
            .catch((err) => this.logger.error(`Contract notification log hatası: ${err}`));

          // Manager log: Müşteri iş geçmişine kayıt
          if (contract.customerId && successCount > 0) {
            await this.createContractNotificationManagerLog(
              contract.customerId,
              contract.contractId || contract.id,
              customer.name || "",
              milestone,
              true
            );
          }

          return {
            status: "processed" as const,
            sent: successCount,
            failed: failCount,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Yıllık kontrat bildirimi gönderilemedi: ${contract.contractId}`,
            error
          );

          // System log: Hata durumu
          await this.systemLogsService
            .log(SystemLogCategory.CRON, SystemLogAction.CONTRACT_NOTIFICATION_FAILED, "contract-notification", {
              entityId: contract.contractId || contract.id,
              entityType: "Contract",
              status: SystemLogStatus.ERROR,
              details: {
                customerId: contract.customerId,
                contractId: contract.contractId,
                milestone,
                templateCode,
              },
              errorMessage,
            })
            .catch((err) => this.logger.error(`Contract notification error log hatası: ${err}`));

          return { status: "error" as const };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        const value = result.value;
        if (value.status === "processed") {
          sent += value.sent;
          failed += value.failed;
        } else if (value.status === "skipped-duplicate") {
          skippedDuplicate++;
        } else if (value.status === "failed" || value.status === "error") {
          failed++;
        } else if (value.status === "dry-run") {
          sent++;
        }
      } else {
        failed++;
      }
    }

    if (skippedDuplicate > 0) {
      this.logger.log(`${skippedDuplicate} kontrat duplicate nedeniyle atlandı`);
    }

    return { sent, failed };
  }

  /**
   * Termination check: Bitiş tarihinden 6 gün sonra ödeme yapılmamışsa mock sonlandırma.
   */
  private async processTerminationCheck(
    today: Date,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<void> {
    const terminationTargetDate = new Date(today);
    terminationTargetDate.setDate(terminationTargetDate.getDate() - TERMINATION_DAY);

    const targetDateStart = new Date(terminationTargetDate);
    targetDateStart.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(terminationTargetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    const contracts = await this.contractModel
      .find({
        yearly: true,
        isActive: true,
        noEndDate: false,
        endDate: { $gte: targetDateStart, $lte: targetDateEnd },
      })
      .lean()
      .exec();

    this.logger.log(
      `Termination check (+${TERMINATION_DAY} gün): ${contracts.length} kontrat bulundu`
    );

    for (const contract of contracts) {
      // Müşteri bilgisini al
      const customer = await this.customerModel
        .findOne({ id: contract.customerId })
        .lean()
        .exec();
      const customerName = customer?.name || "Bilinmiyor";

      // TODO: Gerçek ödeme kontrolü yapılacak
      // Şimdilik mock: Ödeme yapılmadığını varsayıyoruz
      const paymentReceived = false;

      if (!paymentReceived) {
        if (settings.dryRunMode) {
          this.logger.log(
            `[DRY RUN] [MOCK TERMINATION] Kontrat ${contract.contractId} için hizmet sonlandırma tetiklenecekti`
          );
        } else {
          // TODO: Gerçek hizmet sonlandırma implementasyonu
          this.logger.warn(
            `[MOCK TERMINATION] Kontrat ${contract.contractId} için hizmet sonlandırma tetiklendi (mock - gerçek aksiyon yok)`
          );

          // System log: Termination tetiklendi
          await this.systemLogsService
            .log(SystemLogCategory.CRON, SystemLogAction.CONTRACT_TERMINATION_TRIGGERED, "contract-notification", {
              entityId: contract.contractId || contract.id,
              entityType: "Contract",
              status: SystemLogStatus.SUCCESS,
              details: {
                customerId: contract.customerId,
                customerName,
                contractId: contract.contractId,
                endDate: contract.endDate,
                message: `${contract.contractId} nolu kontrat için hizmet sonlandırma tetiklendi (ödeme alınmadı)`,
              },
            })
            .catch((err) => this.logger.error(`Contract termination log hatası: ${err}`));

          // Manager log: Müşteri iş geçmişine kayıt
          if (contract.customerId) {
            await this.createContractTerminationManagerLog(
              contract.customerId,
              contract.contractId || contract.id,
              customerName,
              false
            );
          }

          // Yönetici maili gönder
          await this.sendContractTerminationAdminEmail(
            contract,
            customerName,
            "Ödeme alınmadığı için hizmet sonlandırma tetiklendi"
          );
        }
      } else {
        // TODO: Gerçek kontrat yenileme implementasyonu
        this.logger.log(
          `[MOCK RENEWAL] Kontrat ${contract.contractId} için ödeme alındı, yenileme tetiklendi (mock)`
        );

        // System log: Renewal tetiklendi
        await this.systemLogsService
          .log(SystemLogCategory.CRON, SystemLogAction.CONTRACT_RENEWAL_TRIGGERED, "contract-notification", {
            entityId: contract.contractId || contract.id,
            entityType: "Contract",
            status: SystemLogStatus.SUCCESS,
            details: {
              customerId: contract.customerId,
              customerName,
              contractId: contract.contractId,
              message: `${contract.contractId} nolu kontrat yenilendi (ödeme alındı)`,
            },
          })
          .catch((err) => this.logger.error(`Contract renewal log hatası: ${err}`));

        // Manager log: Müşteri iş geçmişine kayıt
        if (contract.customerId) {
          await this.createContractRenewalManagerLog(
            contract.customerId,
            contract.contractId || contract.id,
            customerName,
            true
          );
        }
      }
    }
  }

  /**
   * Aylık/diğer kontratlar için mevcut bitiş bildirimi akışı (geriye uyumluluk).
   */
  private async processContractsExpiring(
    today: Date,
    days: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() + days);
    const { monthStart, monthEnd } = getMonthBoundaries(targetDate);

    // Yıllık olmayan kontratlar için mevcut akış
    const contracts = await this.contractModel
      .find({
        yearly: { $ne: true },
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

    this.logger.log(
      `Aylık kontrat bitiş (${days} gün): ${contracts.length} kontrat bulundu`
    );

    return this.sendNotificationsForContracts(contracts, today, settings);
  }

  /**
   * Aylık kontratlar için bildirim gönderir (mevcut akış).
   */
  private async sendNotificationsForContracts(
    contracts: Contract[],
    referenceDate: Date,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;
    let skippedDuplicate = 0;

    const contractIds = contracts.map((c) => c.id).filter(Boolean);
    const sentConditionsMap =
      await this.dispatchService.getDistinctTemplateCodesForContracts(contractIds);

    const emailTemplateCode = "contract-renewal-pre-expiry-email";
    const smsTemplateCode = "contract-expiry-sms";

    for (const contract of contracts) {
      try {
        const endDate = contract.endDate ? new Date(contract.endDate) : null;
        const remainingDays = calculateRemainingDays(endDate, referenceDate);

        const sentConditions = sentConditionsMap.get(contract.id) ?? [];
        const emailAlreadySent = sentConditions.includes(emailTemplateCode);
        const smsAlreadySent = sentConditions.includes(smsTemplateCode);

        if (emailAlreadySent && smsAlreadySent) {
          skippedDuplicate++;
          continue;
        }

        const customer = await this.customerModel
          .findOne({ id: contract.customerId })
          .lean()
          .exec();

        if (!customer) {
          this.logger.warn(
            `Müşteri bulunamadı: ${contract.customerId} (Kontrat: ${contract.contractId})`
          );
          failed++;
          continue;
        }

        if (settings.dryRunMode) {
          const channels: string[] = [];
          if (settings.emailEnabled && customer.email && !emailAlreadySent)
            channels.push(`email(${customer.email})`);
          if (settings.smsEnabled && customer.phone && !smsAlreadySent)
            channels.push(`sms(${customer.phone})`);
          this.logger.log(
            `[DRY RUN] Kontrat bildirimi: ${contract.contractId}, Kanallar: ${channels.join(", ") || "yok"}`
          );
          sent += channels.length;
          continue;
        }

        const templateData = buildContractTemplateData(
          contract,
          customer,
          remainingDays,
          "cron"
        );

        const notifications: DispatchNotificationDto[] = [];

        if (settings.emailEnabled && customer.email && !emailAlreadySent) {
          notifications.push({
            templateCode: emailTemplateCode,
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

        if (settings.smsEnabled && customer.phone && !smsAlreadySent) {
          notifications.push({
            templateCode: smsTemplateCode,
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

        if (notifications.length === 0) {
          continue;
        }

        const results = await this.dispatchService.dispatchBulk(notifications);

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        sent += successCount;
        failed += failCount;

        if (successCount > 0) {
          await this.contractModel.updateOne(
            { _id: contract._id },
            { $set: { lastNotify: new Date() } }
          );
        }
      } catch (error) {
        this.logger.error(
          `Kontrat bildirimi gönderilemedi: ${contract.contractId}`,
          error
        );
        failed++;
      }
    }

    if (skippedDuplicate > 0) {
      this.logger.log(`${skippedDuplicate} kontrat duplicate nedeniyle atlandı`);
    }

    return { sent, failed };
  }

  /**
   * Cycle key oluşturur (endDate bazlı).
   * Aynı kontratın farklı yenileme döngülerinde tekrar bildirim alabilmesi için.
   */
  private generateCycleKey(endDate: Date): string {
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /**
   * Artış oranı bilgisini formatlar.
   */
  private formatIncreaseRateInfo(pricing: RenewalPricingResult): string {
    const parts: string[] = [];

    if (pricing.currencyBreakdown.tl.old > 0) {
      parts.push(`TL: %${(pricing.tlIncreaseRate * 100).toFixed(1)} (${pricing.inflationSource})`);
    }

    if (pricing.currencyBreakdown.usd.old > 0) {
      parts.push(`USD: %${(pricing.usdIncreaseRate * 100).toFixed(1)}`);
    }

    if (pricing.currencyBreakdown.eur.old > 0) {
      parts.push(`EUR: %5`);
    }

    return parts.join(", ") || "Artış uygulanmadı";
  }

  /**
   * Sonlandırma tarihini hesaplar (endDate + 6 gün).
   */
  private calculateTerminationDate(endDate: Date | undefined): string {
    if (!endDate) return "";
    const termDate = new Date(endDate);
    termDate.setDate(termDate.getDate() + TERMINATION_DAY);
    return formatDate(termDate);
  }

  /**
   * Dry run: Gerçek bildirim göndermeden ne olacağını raporlar.
   */
  async dryRun(): Promise<ContractNotificationDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items: ContractDryRunItem[] = [];
    let emailCount = 0;
    let smsCount = 0;

    // Yıllık kontratlar için dry run
    for (const days of settings.contractExpiryDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);

      const targetDateStart = new Date(targetDate);
      targetDateStart.setHours(0, 0, 0, 0);
      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);

      const yearlyContracts = await this.contractModel
        .find({
          yearly: true,
          isActive: true,
          noEndDate: false,
          noNotification: false,
          endDate: { $gte: targetDateStart, $lte: targetDateEnd },
        })
        .lean()
        .exec();

      for (const contract of yearlyContracts) {
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
            skippedReason: `Müşteri bulunamadı: ${contract.customerId}`,
          });
          continue;
        }

        const notifications: DryRunNotificationItem[] = [];

        if (settings.emailEnabled && customer.email) {
          notifications.push({
            templateCode: "contract-renewal-pre-expiry-email",
            channel: "email",
            recipient: { email: customer.email, name: customer.name },
            contextType: "contract",
            contextId: contract.id,
            customerId: contract.customerId,
            templateData: { milestone: "pre-expiry", daysFromExpiry: days },
          });
          emailCount++;
        }

        items.push({
          contractId: contract.contractId || contract.id,
          company: contract.company || "",
          customerId: contract.customerId || "",
          customerName: customer.name || "",
          endDate: endDate ? formatDate(endDate) : "",
          remainingDays,
          notifications,
          isYearly: true,
        });
      }
    }

    // Aylık kontratlar için dry run (mevcut akış)
    for (const days of settings.contractExpiryDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const { monthStart, monthEnd } = getMonthBoundaries(targetDate);

      const contracts = await this.contractModel
        .find({
          yearly: { $ne: true },
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
            skippedReason: `Müşteri bulunamadı: ${contract.customerId}`,
          });
          continue;
        }

        const templateData = buildContractTemplateData(contract, customer, remainingDays, "cron");
        const notifications: DryRunNotificationItem[] = [];

        if (settings.emailEnabled && customer.email) {
          notifications.push({
            templateCode: "contract-renewal-pre-expiry-email",
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
          customerName: customer.name || "",
          endDate: endDate ? formatDate(endDate) : "",
          remainingDays,
          notifications,
          isYearly: false,
        });
      }
    }

    return {
      cronName: "contract-notification-monthly",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        monthlyContractNotificationCronEnabled:
          settings.monthlyContractNotificationCronEnabled,
        yearlyContractNotificationCronEnabled:
          settings.yearlyContractNotificationCronEnabled,
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

  /**
   * Kontrat bildirimi için manager-log kaydı oluşturur.
   */
  private async createContractNotificationManagerLog(
    customerId: string,
    contractId: string,
    customerName: string,
    milestone: MilestoneType,
    success: boolean
  ): Promise<void> {
    try {
      const milestoneLabels: Record<MilestoneType, string> = {
        "pre-expiry": "bitiş öncesi",
        "post-1": "bitiş sonrası 1. gün",
        "post-3": "bitiş sonrası 3. gün",
        "post-5": "bitiş sonrası 5. gün",
        "termination": "sonlandırma",
      };

      const message = success
        ? `${contractId} nolu kontrat için ${milestoneLabels[milestone]} yenileme bildirimi gönderildi.`
        : `${contractId} nolu kontrat için ${milestoneLabels[milestone]} bildirimi gönderilemedi.`;

      await this.managerLogService.create({
        customerId,
        contextType: "contract",
        contextId: contractId,
        message,
        authorId: "system",
        authorName: "Sistem",
        references: [
          {
            type: "contract",
            id: contractId,
            label: `Kontrat #${contractId}`,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Contract notification manager log hatası: ${err}`);
    }
  }

  /**
   * Kontrat yenileme için manager-log kaydı oluşturur.
   */
  private async createContractRenewalManagerLog(
    customerId: string,
    contractId: string,
    customerName: string,
    success: boolean
  ): Promise<void> {
    try {
      const message = success
        ? `${contractId} nolu kontrat yenilendi.`
        : `${contractId} nolu kontrat yenileme başarısız oldu.`;

      await this.managerLogService.create({
        customerId,
        contextType: "contract",
        contextId: contractId,
        message,
        authorId: "system",
        authorName: "Sistem",
        references: [
          {
            type: "contract",
            id: contractId,
            label: `Kontrat #${contractId}`,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Contract renewal manager log hatası: ${err}`);
    }
  }

  /**
   * Kontrat sonlandırma için manager-log kaydı oluşturur.
   */
  private async createContractTerminationManagerLog(
    customerId: string,
    contractId: string,
    customerName: string,
    paymentReceived: boolean
  ): Promise<void> {
    try {
      const message = paymentReceived
        ? `${contractId} nolu kontrat için ödeme alındı, hizmet devam ediyor.`
        : `${contractId} nolu kontrat için ödeme alınmadı, hizmet sonlandırma tetiklendi.`;

      await this.managerLogService.create({
        customerId,
        contextType: "contract",
        contextId: contractId,
        message,
        authorId: "system",
        authorName: "Sistem",
        references: [
          {
            type: "contract",
            id: contractId,
            label: `Kontrat #${contractId}`,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Contract termination manager log hatası: ${err}`);
    }
  }

  /**
   * Kontrat sonlandırma için yönetici email bildirimi gönderir.
   */
  private async sendContractTerminationAdminEmail(
    contract: Contract,
    customerName: string,
    reason: string
  ): Promise<void> {
    try {
      const settings = await this.settingsService.getSettings();
      const emails = settings.paymentSuccessNotifyEmails || [];

      if (emails.length === 0) {
        return;
      }

      const dateStr = new Date().toLocaleString("tr-TR", {
        dateStyle: "short",
        timeStyle: "short",
      });

      const endDateStr = contract.endDate
        ? new Date(contract.endDate).toLocaleDateString("tr-TR")
        : "-";

      const subject = `⚠️ Kontrat Sonlandırma - ${customerName}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">⚠ Kontrat Sonlandırma Tetiklendi</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Müşteri:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Kontrat No:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${contract.contractId || contract.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Bitiş Tarihi:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${endDateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Sebep:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #ef4444;">${reason}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Tarih:</strong></td>
              <td style="padding: 8px 0;">${dateStr}</td>
            </tr>
          </table>
          <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
            Bu email otomatik olarak gönderilmiştir. Lütfen müşteri ile iletişime geçin.
          </p>
        </div>
      `;

      for (const email of emails) {
        try {
          await this.emailService.send({
            to: email,
            subject,
            html,
          });
          this.logger.log(`Kontrat sonlandırma bildirimi gönderildi: ${email}`);
        } catch (err) {
          this.logger.error(`Kontrat sonlandırma bildirimi gönderilemedi (${email}): ${err}`);
        }
      }
    } catch (err) {
      this.logger.error(`Kontrat sonlandırma admin email hatası: ${err}`);
    }
  }
}
