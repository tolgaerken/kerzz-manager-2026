import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentsService } from "../../payments/payments.service";
import { Contract } from "../../contracts/schemas/contract.schema";
import { Customer } from "../../customers/schemas/customer.schema";

export interface ContractPaymentLinkResult {
  url: string;
  linkId: string;
  success: boolean;
  error?: string;
}

@Injectable()
export class ContractPaymentLinkHelper {
  private readonly logger = new Logger(ContractPaymentLinkHelper.name);
  private readonly paymentBaseUrl: string;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    this.paymentBaseUrl =
      this.configService.get<string>("PAYMENT_BASE_URL") ||
      "https://pay-kerzz.cloudlabs.com.tr";
  }

  /**
   * Kontrat yenileme tutarı için ödeme linki oluşturur.
   * Başarısız olursa fallback URL döner.
   */
  async createRenewalPaymentLink(
    contract: Contract,
    customer: Customer,
    renewalAmount: number,
    source: "cron" | "manual" = "cron",
  ): Promise<ContractPaymentLinkResult> {
    const fallbackUrl = `${this.paymentBaseUrl}/kontrat-yenileme/${contract.id}`;

    if (!customer.email || renewalAmount <= 0) {
      return {
        url: fallbackUrl,
        linkId: "",
        success: false,
        error: "E-posta veya tutar geçersiz",
      };
    }

    try {
      const result = await this.paymentsService.createPaymentLink({
        amount: renewalAmount,
        email: customer.email,
        name: customer.name || "",
        customerName: customer.name || "",
        customerId: customer.id || "",
        companyId: contract.internalFirm || "VERI",
        staffName: source === "cron" ? "Kontrat Yenileme Cron" : "Manuel Bildirim",
        canRecurring: true,
        contextType: "contract",
        contextId: contract.id,
        contractNo: contract.contractId || "",
        notificationSource: source,
        gsm: customer.phone || "",
        brand: customer.brand || "",
        erpId: customer.erpId || "",
      });

      return {
        url: result.url,
        linkId: result.linkId,
        success: true,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Kontrat yenileme için ödeme linki oluşturulamadı (${contract.contractId}): ${errorMessage}`
      );

      return {
        url: fallbackUrl,
        linkId: "",
        success: false,
        error: errorMessage,
      };
    }
  }
}
