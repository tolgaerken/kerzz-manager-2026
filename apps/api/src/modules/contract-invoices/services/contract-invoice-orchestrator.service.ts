import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { buildPayDateMonthFilter } from "../utils/date.utils";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../../contract-payments/schemas/contract-payment.schema";
import { PaymentPlanService } from "../../contract-payments/services/payment-plan.service";
import { InvoiceCreatorService } from "./invoice-creator.service";
import { InvoiceMergerService } from "./invoice-merger.service";
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
    private readonly paymentPlanService: PaymentPlanService,
    private readonly invoiceCreatorService: InvoiceCreatorService,
    private readonly invoiceMergerService: InvoiceMergerService,
  ) {}

  /**
   * Belirli bir donem ve tarih icin odeme planlarini getirir.
   * Aggregation pipeline ile tum filtreleme ve join islemleri database seviyesinde yapilir.
   */
  async getPaymentPlans(
    period: string,
    date: string,
  ): Promise<{ data: EnrichedPaymentPlan[]; total: number }> {
    const monthFilter = buildPayDateMonthFilter(date);
    const isYearly = period === "yearly";

    // Aggregation pipeline ile tum islemleri database'de yap
    const results = await this.paymentModel
      .aggregate([
        // 1) Tarih filtresi (timezone-aware)
        { $match: monthFilter },

        // 2) Contract bilgilerini join et
        {
          $lookup: {
            from: "contracts",
            localField: "contractId",
            foreignField: "id",
            as: "contract",
          },
        },
        { $unwind: { path: "$contract", preserveNullAndEmptyArrays: true } },

        // 3) Contract filtreleri (isFree, yearly)
        {
          $match: {
            "contract.isFree": { $ne: true },
            "contract.yearly": isYearly,
          },
        },

        // 4) ERP Balance bilgilerini join et
        {
          $lookup: {
            from: "erp-balances",
            localField: "companyId",
            foreignField: "CariKodu",
            as: "erpBalance",
          },
        },

        // 5) License bilgilerini join et (block durumu icin)
        {
          $lookup: {
            from: "licenses",
            localField: "customerId",
            foreignField: "customerId",
            as: "licenses",
          },
        },

        // 6) Alanlari zenginlestir ve formatla
        {
          $project: {
            _id: { $toString: "$_id" },
            id: 1,
            type: { $ifNull: ["$type", "regular"] },
            contractId: 1,
            company: { $ifNull: ["$company", ""] },
            brand: {
              $ifNull: ["$brand", { $ifNull: ["$contract.brand", ""] }],
            },
            customerId: { $ifNull: ["$customerId", ""] },
            licanceId: { $ifNull: ["$licanceId", ""] },
            invoiceNo: { $ifNull: ["$invoiceNo", ""] },
            paid: { $ifNull: ["$paid", false] },
            payDate: 1,
            paymentDate: 1,
            invoiceDate: 1,
            total: { $ifNull: ["$total", 0] },
            invoiceTotal: { $ifNull: ["$invoiceTotal", 0] },
            // ERP Balance
            balance: {
              $ifNull: [
                { $arrayElemAt: ["$erpBalance.ToplamGecikme", 0] },
                -100,
              ],
            },
            list: { $ifNull: ["$list", []] },
            yearly: { $ifNull: ["$yearly", false] },
            eInvoice: { $ifNull: ["$eInvoice", false] },
            uuid: { $ifNull: ["$uuid", ""] },
            ref: { $ifNull: ["$ref", ""] },
            taxNo: { $ifNull: ["$taxNo", ""] },
            internalFirm: {
              $ifNull: [
                "$internalFirm",
                { $ifNull: ["$contract.internalFirm", ""] },
              ],
            },
            contractNumber: { $ifNull: ["$contract.no", 0] },
            segment: { $ifNull: ["$segment", ""] },
            // Block durumu: Tum lisanslar bloklu ise true
            block: {
              $cond: {
                if: { $gt: [{ $size: "$licenses" }, 0] },
                then: {
                  $let: {
                    vars: {
                      blockedCount: {
                        $size: {
                          $filter: {
                            input: "$licenses",
                            as: "lic",
                            cond: { $eq: ["$$lic.block", true] },
                          },
                        },
                      },
                      totalCount: { $size: "$licenses" },
                    },
                    in: {
                      $and: [
                        { $gt: ["$$blockedCount", 0] },
                        { $eq: ["$$blockedCount", "$$totalCount"] },
                      ],
                    },
                  },
                },
                else: false,
              },
            },
            editDate: 1,
            editUser: { $ifNull: ["$editUser", ""] },
            companyId: { $ifNull: ["$companyId", ""] },
            dueDate: 1,
            invoiceError: { $ifNull: ["$invoiceError", ""] },
          },
        },

        // 7) Sirala
        { $sort: { company: 1 } },
      ])
      .exec();

    return { data: results as EnrichedPaymentPlan[], total: results.length };
  }

  /**
   * Secili odeme planlarindan fatura olusturur.
   * @param merge - true ise ayni cariye ait planlari tek faturada birlestirir
   */
  async createInvoices(
    planIds: string[],
    merge = false,
  ): Promise<CreateInvoiceResult[]> {
    if (merge) {
      return this.invoiceMergerService.createMergedInvoices(planIds);
    }
    return this.invoiceCreatorService.createFromPaymentPlans(planIds);
  }

  /**
   * Secili odeme planlarindan birlestirilmis fatura olusturur.
   * Ayni customerId + ayni ay icin olan planlari tek faturada birlestirir.
   */
  async createMergedInvoices(planIds: string[]): Promise<CreateInvoiceResult[]> {
    return this.invoiceMergerService.createMergedInvoices(planIds);
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
}
