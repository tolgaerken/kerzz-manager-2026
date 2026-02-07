import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../../contract-payments/schemas/contract-payment.schema";
import {
  Contract,
  ContractDocument,
} from "../../contracts/schemas/contract.schema";
import {
  ErpBalance,
  ErpBalanceDocument,
} from "../../erp/schemas/erp-balance.schema";
import {
  License,
  LicenseDocument,
} from "../../licenses/schemas/license.schema";
import { PaymentPlanService } from "../../contract-payments/services/payment-plan.service";
import { InvoiceCreatorService } from "./invoice-creator.service";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import type { EnrichedPaymentPlan, CreateInvoiceResult } from "../interfaces";

@Injectable()
export class ContractInvoiceOrchestratorService {
  private readonly logger = new Logger(
    ContractInvoiceOrchestratorService.name,
  );

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(ErpBalance.name, CONTRACT_DB_CONNECTION)
    private erpBalanceModel: Model<ErpBalanceDocument>,
    @InjectModel(License.name, CONTRACT_DB_CONNECTION)
    private licenseModel: Model<LicenseDocument>,
    private readonly paymentPlanService: PaymentPlanService,
    private readonly invoiceCreatorService: InvoiceCreatorService,
  ) {}

  /**
   * Belirli bir donem ve tarih icin odeme planlarini getirir.
   * Dinamik alanlar (balance, block) hafif lookup ile eklenir.
   */
  async getPaymentPlans(
    period: string,
    date: string,
  ): Promise<{ data: EnrichedPaymentPlan[]; total: number }> {
    const targetDate = new Date(date);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    const isYearly = period === "yearly";

    // 1) Hedef ay icindeki odeme planlarini cek
    const paymentPlans = await this.paymentModel
      .find({
        payDate: { $gte: monthStart, $lte: monthEnd },
      })
      .sort({ company: 1 })
      .lean()
      .exec();

    // 2) Sadece ilgili kontrat tipini filtrele (aylik/yillik)
    const contractIds = [
      ...new Set(paymentPlans.map((p) => p.contractId)),
    ];
    const contracts = await this.contractModel
      .find({ id: { $in: contractIds } })
      .lean()
      .exec();

    const contractMap = new Map(contracts.map((c) => [c.id, c]));

    const filteredPlans = paymentPlans.filter((plan) => {
      const contract = contractMap.get(plan.contractId);
      if (!contract) return false;
      if (contract.isFree) return false;
      return contract.yearly === isYearly;
    });

    // 3) Hafif lookup: balance (ERP) ve block (Licenses)
    const enrichedPlans = await this.enrichWithDynamicFields(filteredPlans);

    return { data: enrichedPlans, total: enrichedPlans.length };
  }

  /**
   * Secili odeme planlarindan fatura olusturur.
   */
  async createInvoices(planIds: string[]): Promise<CreateInvoiceResult[]> {
    return this.invoiceCreatorService.createFromPaymentPlans(planIds);
  }

  /**
   * Secili odeme planlarindaki kontratlari kontrol eder.
   */
  async checkContracts(
    planIds: string[],
  ): Promise<{ planId: string; success: boolean; error?: string }[]> {
    const results: { planId: string; success: boolean; error?: string }[] = [];

    // Plan'lardan benzersiz contractId'leri cek
    const plans = await this.paymentModel
      .find({ id: { $in: planIds } })
      .lean()
      .exec();

    const uniqueContractIds = [
      ...new Set(plans.map((p) => p.contractId)),
    ];

    for (const contractId of uniqueContractIds) {
      try {
        await this.paymentPlanService.checkContractById(contractId);
        // Bu contractId'ye ait planlari basarili isle
        const relatedPlanIds = plans
          .filter((p) => p.contractId === contractId)
          .map((p) => p.id);
        for (const planId of relatedPlanIds) {
          results.push({ planId, success: true });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        const relatedPlanIds = plans
          .filter((p) => p.contractId === contractId)
          .map((p) => p.id);
        for (const planId of relatedPlanIds) {
          results.push({ planId, success: false, error: errorMessage });
        }
      }
    }

    return results;
  }

  /**
   * Odeme planlarina dinamik alanlar ekler (balance, block).
   * Toplu sorgularla N+1 problemini onler.
   */
  private async enrichWithDynamicFields(
    plans: ContractPayment[],
  ): Promise<EnrichedPaymentPlan[]> {
    if (plans.length === 0) return [];

    // Benzersiz companyId'leri ve customerId'leri topla
    const companyIds = [
      ...new Set(plans.map((p) => p.companyId).filter(Boolean)),
    ];
    const customerIds = [
      ...new Set(plans.map((p) => p.customerId).filter(Boolean)),
    ];

    // Toplu sorgular (paralel)
    const [erpBalances, licenses] = await Promise.all([
      companyIds.length > 0
        ? this.erpBalanceModel
            .find({ CariKodu: { $in: companyIds } })
            .lean()
            .exec()
        : [],
      customerIds.length > 0
        ? this.licenseModel
            .find({ customerId: { $in: customerIds } })
            .lean()
            .exec()
        : [],
    ]);

    // Hizli erisim icin Map olustur
    const balanceMap = new Map(
      erpBalances.map((b) => [b.CariKodu, b.ToplamGecikme ?? 0]),
    );

    // Musteri basina lisans blok durumu: tum lisanslari bloklu ise true
    const blockMap = new Map<string, boolean>();
    const licensesGrouped = new Map<string, License[]>();

    for (const license of licenses) {
      const existing = licensesGrouped.get(license.customerId) || [];
      existing.push(license);
      licensesGrouped.set(license.customerId, existing);
    }

    for (const [customerId, customerLicenses] of licensesGrouped) {
      if (customerLicenses.length === 0) {
        blockMap.set(customerId, false);
        continue;
      }
      const blockedCount = customerLicenses.filter((l) => l.block).length;
      blockMap.set(
        customerId,
        blockedCount > 0 && blockedCount === customerLicenses.length,
      );
    }

    // Planlari zenginlestir
    return plans.map((plan) => ({
      _id: plan._id?.toString() || "",
      id: plan.id,
      contractId: plan.contractId,
      company: plan.company || "",
      brand: plan.brand || "",
      customerId: plan.customerId || "",
      licanceId: plan.licanceId || "",
      invoiceNo: plan.invoiceNo || "",
      paid: plan.paid || false,
      payDate: plan.payDate,
      paymentDate: plan.paymentDate,
      invoiceDate: plan.invoiceDate,
      total: plan.total || 0,
      invoiceTotal: plan.invoiceTotal || 0,
      balance: balanceMap.get(plan.companyId) ?? -100,
      list: plan.list || [],
      yearly: plan.yearly || false,
      eInvoice: plan.eInvoice || false,
      uuid: plan.uuid || "",
      ref: plan.ref || "",
      taxNo: plan.taxNo || "",
      internalFirm: plan.internalFirm || "",
      contractNumber: plan.contractNumber || 0,
      segment: plan.segment || "",
      block: blockMap.get(plan.customerId) ?? false,
      editDate: plan.editDate,
      editUser: plan.editUser || "",
      companyId: plan.companyId || "",
      dueDate: plan.dueDate,
      invoiceError: (plan as any).invoiceError || "",
    }));
  }
}
