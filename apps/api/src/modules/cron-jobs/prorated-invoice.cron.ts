import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";
import { ContractInvoiceOrchestratorService } from "../contract-invoices/services/contract-invoice-orchestrator.service";
import { NotificationSettingsService } from "../notification-settings";
import type { ProratedInvoiceDryRunResponse } from "./dto/dry-run.dto";
import type { CronManualRunResponseDto } from "./dto/manual-run.dto";
import { formatDate } from "../notification-queue/notification-data.helper";

/**
 * Kist fatura cron job'i.
 *
 * Her gun saat 09:00'da calisir.
 * Faturasi kesilmemis kist odeme planlarini bulur ve fatura keser.
 * Ayni cariye ait planlar tek faturada birlestirilir.
 */
@Injectable()
export class ProratedInvoiceCron {
  private readonly logger = new Logger(ProratedInvoiceCron.name);

  constructor(
    private readonly proratedPlanService: ProratedPlanService,
    private readonly invoiceOrchestratorService: ContractInvoiceOrchestratorService,
    private readonly settingsService: NotificationSettingsService,
  ) {}

  /**
   * Her gun saat 09:00'da calisir (Europe/Istanbul).
   * Faturasi kesilmemis kist planlari bulur ve toplu fatura keser.
   * Ayni cariye ait planlar tek faturada birlestirilir.
   */
  @Cron("0 9 * * *", { timeZone: "Europe/Istanbul" })
  async processProratedInvoices(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    if (!settings.proratedInvoiceCronEnabled) {
      this.logger.log("⏸️ Kıst fatura cron'u devre dışı");
      return;
    }

    this.logger.log("Kist fatura kontrolu basliyor...");

    const pendingPlans =
      await this.proratedPlanService.findUninvoicedProratedPlans();

    if (pendingPlans.length === 0) {
      this.logger.log("Bekleyen kist plan yok.");
      return;
    }

    this.logger.log(`${pendingPlans.length} adet kist plan bulundu.`);

    // DRY RUN MODU: Gerçek fatura kesme, sadece logla
    if (settings.dryRunMode) {
      this.logger.log(
        `🧪 [DRY RUN] ${pendingPlans.length} kıst plan için fatura kesilecekti — kuru çalışma modunda atlandı`
      );
      for (const plan of pendingPlans) {
        this.logger.log(
          `🧪 [DRY RUN] PlanId: ${plan.id}, CustomerId: ${plan.customerId}, Tutar: ${plan.total}`
        );
      }
      return;
    }

    const planIds = pendingPlans.map((p) => p.id);

    // Ayni cariye ait planlari tek faturada birlestir (merge=true)
    const results =
      await this.invoiceOrchestratorService.createMergedInvoices(planIds);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
    const mergedCount = results.filter((r) => r.mergedPlanIds && r.mergedPlanIds.length > 1).length;

    this.logger.log(
      `Kist fatura islemi tamamlandi: ${successCount} basarili, ${failCount} hatali, ${mergedCount} birlestirilmis fatura.`,
    );

    // Hatali olanlari logla
    for (const result of results) {
      if (!result.success) {
        this.logger.error(
          `Kist fatura hatasi - Plan: ${result.planId}, Hata: ${result.error}`,
        );
      }
    }
  }

  /**
   * Dry run: Gercek fatura kesmeden ne olacagini raporlar
   */
  async dryRun(): Promise<ProratedInvoiceDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const pendingPlans =
      await this.proratedPlanService.findUninvoicedProratedPlans();

    const uniqueCustomers = new Set(pendingPlans.map((p) => p.customerId));
    const totalAmount = pendingPlans.reduce((sum, p) => sum + (p.total || 0), 0);

    const items = pendingPlans.map((plan) => ({
      planId: plan.id,
      contractId: plan.contractId,
      customerId: plan.customerId || "",
      amount: plan.total || 0,
      payDate: plan.payDate ? formatDate(plan.payDate) : "",
      description: plan.company || "",
    }));

    return {
      cronName: "prorated-invoice",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        proratedInvoiceCronEnabled: settings.proratedInvoiceCronEnabled,
      },
      summary: {
        totalUninvoicedPlans: pendingPlans.length,
        uniqueCustomers: uniqueCustomers.size,
        totalAmount,
      },
      items,
    };
  }

  async manualRun(target: { planId: string }): Promise<CronManualRunResponseDto> {
    const startTime = Date.now();
    const executedAt = new Date().toISOString();

    try {
      const settings = await this.settingsService.getSettings();
      if (!settings.proratedInvoiceCronEnabled) {
        return {
          cronName: "prorated-invoice",
          success: true,
          skipped: true,
          message: "Kist fatura cron'u devre disi oldugu icin islem atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      const plan = await this.proratedPlanService.findUninvoicedProratedPlanById(
        target.planId
      );
      if (!plan) {
        return {
          cronName: "prorated-invoice",
          success: true,
          skipped: true,
          message: "Plan bulunamadi veya plan daha once faturalanmis",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            planId: target.planId,
          },
        };
      }

      if (settings.dryRunMode) {
        return {
          cronName: "prorated-invoice",
          success: true,
          skipped: true,
          message: "Dry run modu acik oldugu icin fatura kesimi yapilmadi",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            planId: plan.id,
            customerId: plan.customerId,
            amount: plan.total,
          },
        };
      }

      const results = await this.invoiceOrchestratorService.createMergedInvoices([
        plan.id,
      ]);
      const result = results.find((item) => item.planId === plan.id) ?? results[0];

      if (!result) {
        return {
          cronName: "prorated-invoice",
          success: false,
          skipped: false,
          message: "Fatura sonucu alinamadi",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      if (!result.success) {
        return {
          cronName: "prorated-invoice",
          success: false,
          skipped: false,
          message: result.error || "Fatura olusturma basarisiz",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            planId: result.planId,
            mergedPlanIds: result.mergedPlanIds,
          },
        };
      }

      return {
        cronName: "prorated-invoice",
        success: true,
        skipped: false,
        message: "Kist plan icin fatura olusturuldu",
        executedAt,
        durationMs: Date.now() - startTime,
        details: {
          planId: result.planId,
          invoiceNo: result.invoiceNo,
          mergedPlanIds: result.mergedPlanIds,
        },
      };
    } catch (error) {
      return {
        cronName: "prorated-invoice",
        success: false,
        skipped: false,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
        executedAt,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
