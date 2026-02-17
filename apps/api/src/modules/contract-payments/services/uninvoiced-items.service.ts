import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  ContractPayment,
  ContractPaymentDocument,
  PaymentListItemCategory,
} from "../schemas/contract-payment.schema";
import {
  Contract,
  ContractDocument,
} from "../../contracts/schemas/contract.schema";
import {
  ContractCashRegister,
  ContractCashRegisterDocument,
} from "../../contract-cash-registers/schemas/contract-cash-register.schema";
import {
  ContractSupport,
  ContractSupportDocument,
} from "../../contract-supports/schemas/contract-support.schema";
import {
  ContractItem,
  ContractItemDocument,
} from "../../contract-items/schemas/contract-item.schema";
import {
  ContractSaas,
  ContractSaasDocument,
} from "../../contract-saas/schemas/contract-saas.schema";
import {
  ContractVersion,
  ContractVersionDocument,
} from "../../contract-versions/schemas/contract-version.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

/** Faturaya dahil edilmemis kalem */
export interface UninvoicedItem {
  id: string;
  category: PaymentListItemCategory;
  description: string;
  contractId: string;
  contractNo?: number;
  company?: string;
}

/** Faturaya dahil edilmemis kalemlerin ozeti */
export interface UninvoicedItemsSummary {
  eftpos: UninvoicedItem[];
  support: UninvoicedItem[];
  version: UninvoicedItem[];
  item: UninvoicedItem[];
  saas: UninvoicedItem[];
  total: number;
}

/** Tarih araligi filtresi */
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class UninvoicedItemsService {
  private readonly logger = new Logger(UninvoicedItemsService.name);

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(ContractCashRegister.name, CONTRACT_DB_CONNECTION)
    private cashRegisterModel: Model<ContractCashRegisterDocument>,
    @InjectModel(ContractSupport.name, CONTRACT_DB_CONNECTION)
    private supportModel: Model<ContractSupportDocument>,
    @InjectModel(ContractItem.name, CONTRACT_DB_CONNECTION)
    private itemModel: Model<ContractItemDocument>,
    @InjectModel(ContractSaas.name, CONTRACT_DB_CONNECTION)
    private saasModel: Model<ContractSaasDocument>,
    @InjectModel(ContractVersion.name, CONTRACT_DB_CONNECTION)
    private versionModel: Model<ContractVersionDocument>,
  ) {}

  /**
   * Belirli bir kontrat icin faturaya dahil edilmemis kalemleri bulur.
   */
  async getUninvoicedItemsByContract(
    contractId: string,
  ): Promise<UninvoicedItemsSummary> {
    // Faturasi kesilmis planlardaki kaynak kalem ID'lerini topla
    const invoicedSourceItemIds = await this.getInvoicedSourceItemIdsByContract(contractId);
    const invoicedSet = new Set(invoicedSourceItemIds);

    // Kontrata ait tum kalemleri cek
    const [cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.cashRegisterModel.find({ contractId, enabled: true }).lean().exec(),
        this.supportModel.find({ contractId, enabled: true }).lean().exec(),
        this.itemModel.find({ contractId, enabled: true }).lean().exec(),
        this.saasModel.find({ contractId, enabled: true }).lean().exec(),
        this.versionModel.find({ contractId, enabled: true }).lean().exec(),
      ]);

    // Faturaya dahil edilmemis kalemleri filtrele
    const uninvoicedEftpos = this.filterUninvoiced(
      cashRegisters,
      invoicedSet,
      "eftpos",
    );
    const uninvoicedSupport = this.filterUninvoiced(
      supports,
      invoicedSet,
      "support",
    );
    const uninvoicedVersion = this.filterUninvoiced(
      versions,
      invoicedSet,
      "version",
    );
    const uninvoicedItem = this.filterUninvoiced(items, invoicedSet, "item");
    const uninvoicedSaas = this.filterUninvoiced(saasItems, invoicedSet, "saas");

    const total =
      uninvoicedEftpos.length +
      uninvoicedSupport.length +
      uninvoicedVersion.length +
      uninvoicedItem.length +
      uninvoicedSaas.length;

    return {
      eftpos: uninvoicedEftpos,
      support: uninvoicedSupport,
      version: uninvoicedVersion,
      item: uninvoicedItem,
      saas: uninvoicedSaas,
      total,
    };
  }

  /**
   * Tum kontratlar icin faturaya dahil edilmemis kalemleri bulur.
   * @param dateRange - Opsiyonel tarih araligi filtresi (createdAt uzerinden)
   */
  async getAllUninvoicedItems(dateRange?: DateRangeFilter): Promise<UninvoicedItemsSummary> {
    // Tum faturasi kesilmis planlardaki kaynak kalem ID'lerini topla
    const invoicedSourceItemIds = await this.getAllInvoicedSourceItemIds();
    const invoicedSet = new Set(invoicedSourceItemIds);

    // Tarih filtresi olustur
    const dateFilter = this.buildDateFilter(dateRange);
    const baseFilter = { enabled: true, ...dateFilter };

    // Tum enabled kalemleri cek (tarih filtresi ile)
    const [cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.cashRegisterModel.find(baseFilter).lean().exec(),
        this.supportModel.find(baseFilter).lean().exec(),
        this.itemModel.find(baseFilter).lean().exec(),
        this.saasModel.find(baseFilter).lean().exec(),
        this.versionModel.find(baseFilter).lean().exec(),
      ]);

    // Faturaya dahil edilmemis kalemleri filtrele
    const uninvoicedEftpos = this.filterUninvoiced(
      cashRegisters,
      invoicedSet,
      "eftpos",
    );
    const uninvoicedSupport = this.filterUninvoiced(
      supports,
      invoicedSet,
      "support",
    );
    const uninvoicedVersion = this.filterUninvoiced(
      versions,
      invoicedSet,
      "version",
    );
    const uninvoicedItem = this.filterUninvoiced(items, invoicedSet, "item");
    const uninvoicedSaas = this.filterUninvoiced(saasItems, invoicedSet, "saas");

    // Tum kalemleri birlestir
    const allItems = [
      ...uninvoicedEftpos,
      ...uninvoicedSupport,
      ...uninvoicedVersion,
      ...uninvoicedItem,
      ...uninvoicedSaas,
    ];

    // Kontrat bilgilerini ekle
    const enrichedItems = await this.enrichWithContractInfo(allItems);

    // Kategorilere ayir
    const eftpos = enrichedItems.filter((i) => i.category === "eftpos");
    const support = enrichedItems.filter((i) => i.category === "support");
    const version = enrichedItems.filter((i) => i.category === "version");
    const item = enrichedItems.filter((i) => i.category === "item");
    const saas = enrichedItems.filter((i) => i.category === "saas");

    return {
      eftpos,
      support,
      version,
      item,
      saas,
      total: enrichedItems.length,
    };
  }

  /**
   * Kalemlere kontrat bilgilerini (no, company) ekler.
   */
  private async enrichWithContractInfo(items: UninvoicedItem[]): Promise<UninvoicedItem[]> {
    if (items.length === 0) return [];

    // Unique contractId'leri topla
    const contractIds = [...new Set(items.map((i) => i.contractId))];

    // Kontrat bilgilerini cek
    const contracts = await this.contractModel
      .find({ id: { $in: contractIds } })
      .select("id no company")
      .lean()
      .exec();

    // Map olustur
    const contractMap = new Map<string, { no?: number; company?: string }>();
    for (const contract of contracts) {
      contractMap.set(contract.id, {
        no: contract.no,
        company: contract.company,
      });
    }

    // Kalemlere kontrat bilgilerini ekle
    return items.map((item) => {
      const contractInfo = contractMap.get(item.contractId);
      return {
        ...item,
        contractNo: contractInfo?.no,
        company: contractInfo?.company,
      };
    });
  }

  /**
   * Tarih araligi filtresini MongoDB query formatina donusturur.
   */
  private buildDateFilter(dateRange?: DateRangeFilter): Record<string, unknown> {
    if (!dateRange?.startDate && !dateRange?.endDate) {
      return {};
    }

    const filter: Record<string, unknown> = {};

    if (dateRange.startDate || dateRange.endDate) {
      filter.createdAt = {};
      if (dateRange.startDate) {
        (filter.createdAt as Record<string, Date>).$gte = dateRange.startDate;
      }
      if (dateRange.endDate) {
        (filter.createdAt as Record<string, Date>).$lte = dateRange.endDate;
      }
    }

    return filter;
  }

  /**
   * Belirli bir kontrat icin faturasi kesilmis kaynak kalem ID'lerini toplar.
   * Iki kaynaktan toplar:
   * 1. sourceItemId alani (kist planlar)
   * 2. list[].sourceItemId alani (normal planlar)
   */
  private async getInvoicedSourceItemIdsByContract(
    contractId: string,
  ): Promise<string[]> {
    const allIds: string[] = [];

    // 1. Kist planlardan sourceItemId
    const proratedIds = await this.paymentModel
      .find({
        contractId,
        sourceItemId: { $exists: true, $ne: "" },
        invoiceNo: { $exists: true, $ne: "" },
      })
      .distinct("sourceItemId")
      .exec();
    allIds.push(...(proratedIds as string[]));

    // 2. Normal planlardan list[].sourceItemId
    const payments = await this.paymentModel
      .find({
        contractId,
        invoiceNo: { $exists: true, $ne: "" },
        "list.sourceItemId": { $exists: true },
      })
      .select("list")
      .lean()
      .exec();

    for (const payment of payments) {
      for (const item of payment.list || []) {
        if (item.sourceItemId) {
          // sourceItemId virgullu olabilir (gruplu kalemler)
          const ids = item.sourceItemId.split(",").filter(Boolean);
          allIds.push(...ids);
        }
      }
    }

    // 3. Legacy report alanından (eski sistemden gelen veriler)
    const legacyIds = await this.getLegacyInvoicedIdsByContract(contractId);
    allIds.push(...legacyIds);

    return [...new Set(allIds)]; // Tekrarlari kaldir
  }

  /**
   * Tum faturasi kesilmis kaynak kalem ID'lerini toplar.
   * Performans icin aggregation pipeline kullanilir.
   */
  private async getAllInvoicedSourceItemIds(): Promise<string[]> {
    const allIdsSet = new Set<string>();

    // 1. Kist planlardan sourceItemId (distinct ile)
    const proratedIds = await this.paymentModel
      .find({
        sourceItemId: { $exists: true, $ne: "" },
        invoiceNo: { $exists: true, $ne: "" },
      })
      .distinct("sourceItemId")
      .exec();
    
    for (const id of proratedIds as string[]) {
      allIdsSet.add(id);
    }

    // 2. Normal planlardan list[].sourceItemId - aggregation ile
    const listSourceIds = await this.paymentModel.aggregate([
      {
        $match: {
          invoiceNo: { $exists: true, $ne: "" },
          "list.sourceItemId": { $exists: true },
        },
      },
      { $unwind: "$list" },
      {
        $match: {
          "list.sourceItemId": { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: null,
          sourceItemIds: { $addToSet: "$list.sourceItemId" },
        },
      },
    ]).exec();

    if (listSourceIds.length > 0 && listSourceIds[0].sourceItemIds) {
      for (const sourceItemId of listSourceIds[0].sourceItemIds as string[]) {
        // sourceItemId virgullu olabilir (gruplu kalemler)
        const ids = sourceItemId.split(",").filter(Boolean);
        for (const id of ids) {
          allIdsSet.add(id);
        }
      }
    }

    // 3. Legacy report alanından (eski sistemden gelen veriler)
    const legacyIds = await this.getAllLegacyInvoicedIds();
    for (const id of legacyIds) {
      allIdsSet.add(id);
    }

    return Array.from(allIdsSet);
  }

  /**
   * Belirli bir kontrat icin legacy report alanindaki faturali kalem ID'lerini toplar.
   */
  private async getLegacyInvoicedIdsByContract(
    contractId: string,
  ): Promise<string[]> {
    const allIds: string[] = [];

    const payments = await this.paymentModel
      .find({
        contractId,
        invoiceNo: { $exists: true, $ne: "" },
        report: { $exists: true },
      })
      .select("report")
      .lean()
      .exec();

    for (const payment of payments) {
      const report = (payment as unknown as { report?: LegacyReport }).report;
      if (report) {
        this.extractLegacyIds(report, allIds);
      }
    }

    return allIds;
  }

  /**
   * Tum legacy report alanindaki faturali kalem ID'lerini toplar.
   * Performans icin aggregation pipeline kullanilir.
   */
  private async getAllLegacyInvoicedIds(): Promise<string[]> {
    const allIdsSet = new Set<string>();
    const categories = ["saas", "eftpos", "support", "item", "version"] as const;

    // Her kategori icin ayri aggregation yap
    for (const category of categories) {
      const result = await this.paymentModel.aggregate([
        {
          $match: {
            invoiceNo: { $exists: true, $ne: "" },
            [`report.${category}`]: { $exists: true, $ne: [] },
          },
        },
        { $unwind: `$report.${category}` },
        {
          $match: {
            [`report.${category}.id`]: { $exists: true, $ne: "" },
          },
        },
        {
          $group: {
            _id: null,
            ids: { $addToSet: `$report.${category}.id` },
          },
        },
      ]).exec();

      if (result.length > 0 && result[0].ids) {
        for (const id of result[0].ids as string[]) {
          allIdsSet.add(id);
        }
      }
    }

    return Array.from(allIdsSet);
  }

  /**
   * Legacy report objesinden ID'leri cikarir.
   */
  private extractLegacyIds(report: LegacyReport, allIds: string[]): void {
    const categories = ["saas", "eftpos", "support", "item", "version"] as const;
    for (const category of categories) {
      const items = report[category];
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item?.id) {
            allIds.push(item.id);
          }
        }
      }
    }
  }

  /**
   * Faturaya dahil edilmemis kalemleri filtreler.
   */
  private filterUninvoiced<
    T extends { id: string; contractId: string; description?: string },
  >(
    items: T[],
    invoicedSet: Set<string>,
    category: PaymentListItemCategory,
  ): UninvoicedItem[] {
    return items
      .filter((item) => !invoicedSet.has(item.id))
      .map((item) => ({
        id: item.id,
        category,
        description: item.description || "",
        contractId: item.contractId,
      }));
  }
}

/** Legacy report yapisi (eski sistemden gelen veriler) */
interface LegacyReport {
  saas?: Array<{ id: string }>;
  eftpos?: Array<{ id: string }>;
  support?: Array<{ id: string }>;
  item?: Array<{ id: string }>;
  version?: Array<{ id: string }>;
}
