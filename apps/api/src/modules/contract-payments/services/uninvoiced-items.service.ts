import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  ContractPayment,
  ContractPaymentDocument,
  PaymentListItemCategory,
} from "../schemas/contract-payment.schema";
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

@Injectable()
export class UninvoicedItemsService {
  private readonly logger = new Logger(UninvoicedItemsService.name);

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private paymentModel: Model<ContractPaymentDocument>,
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
   */
  async getAllUninvoicedItems(): Promise<UninvoicedItemsSummary> {
    // Tum faturasi kesilmis planlardaki kaynak kalem ID'lerini topla
    const invoicedSourceItemIds = await this.getAllInvoicedSourceItemIds();
    const invoicedSet = new Set(invoicedSourceItemIds);

    // Tum enabled kalemleri cek
    const [cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.cashRegisterModel.find({ enabled: true }).lean().exec(),
        this.supportModel.find({ enabled: true }).lean().exec(),
        this.itemModel.find({ enabled: true }).lean().exec(),
        this.saasModel.find({ enabled: true }).lean().exec(),
        this.versionModel.find({ enabled: true }).lean().exec(),
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
   */
  private async getAllInvoicedSourceItemIds(): Promise<string[]> {
    const allIds: string[] = [];

    // 1. Kist planlardan sourceItemId
    const proratedIds = await this.paymentModel
      .find({
        sourceItemId: { $exists: true, $ne: "" },
        invoiceNo: { $exists: true, $ne: "" },
      })
      .distinct("sourceItemId")
      .exec();
    allIds.push(...(proratedIds as string[]));

    // 2. Normal planlardan list[].sourceItemId
    const payments = await this.paymentModel
      .find({
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
    const legacyIds = await this.getAllLegacyInvoicedIds();
    allIds.push(...legacyIds);

    return [...new Set(allIds)]; // Tekrarlari kaldir
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
   */
  private async getAllLegacyInvoicedIds(): Promise<string[]> {
    const allIds: string[] = [];

    const payments = await this.paymentModel
      .find({
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
