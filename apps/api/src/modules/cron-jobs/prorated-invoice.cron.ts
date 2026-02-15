import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";
import { ContractInvoiceOrchestratorService } from "../contract-invoices/services/contract-invoice-orchestrator.service";
import { NotificationSettingsService } from "../notification-settings";

/**
 * Kist fatura cron job'i.
 *
 * Her gun saat 09:00'da calisir.
 * Faturasi kesilmemis kist odeme planlarini bulur ve fatura keser.
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

    const planIds = pendingPlans.map((p) => p.id);
    const results =
      await this.invoiceOrchestratorService.createInvoices(planIds);

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    this.logger.log(
      `Kist fatura islemi tamamlandi: ${successCount} basarili, ${failCount} hatali.`,
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
}
