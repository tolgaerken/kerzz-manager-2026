import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExchangeRateService } from "../../exchange-rate";
import { ErpSettingsService } from "../../erp-settings";
import {
  InvoiceRow,
  InvoiceRowCategory,
  InvoiceSummary,
  CurrencyType,
  SubTotals,
  CalculateAllResult,
} from "../interfaces/payment-plan.interfaces";
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
import {
  SoftwareProduct,
  SoftwareProductDocument,
} from "../../software-products/schemas/software-product.schema";
import {
  Contract,
  ContractDocument,
} from "../../contracts/schemas/contract.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { generateShortId } from "../utils/id-generator";
import {
  EFTPOS_DESCRIPTION,
  EFTPOS_NO_VAT_DESCRIPTION,
  SUPPORT_DESCRIPTION,
  VERSION_DESCRIPTION,
} from "../constants/invoice.constants";

@Injectable()
export class InvoiceCalculatorService {
  private readonly logger = new Logger(InvoiceCalculatorService.name);

  constructor(
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
    @InjectModel(SoftwareProduct.name, CONTRACT_DB_CONNECTION)
    private softwareProductModel: Model<SoftwareProductDocument>,
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly erpSettingsService: ErpSettingsService,
  ) {}

  /**
   * Tek seferde fatura ozeti ve alt toplamlari hesaplar.
   * Veritabani sorgularini tek noktada toplar, tekrar eden sorgulari onler.
   */
  async calculateAll(contractId: string): Promise<CalculateAllResult> {
    const [contract, cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.contractModel.findOne({ id: contractId }).lean().exec(),
        this.cashRegisterModel.find({ contractId }).lean().exec(),
        this.supportModel.find({ contractId }).lean().exec(),
        this.itemModel.find({ contractId }).lean().exec(),
        this.saasModel.find({ contractId }).lean().exec(),
        this.versionModel.find({ contractId }).lean().exec(),
      ]);

    const invoiceSummary = await this.buildInvoiceSummary(
      contract,
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
    );

    const subTotals = await this.buildSubTotals(
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
    );

    return { invoiceSummary, subTotals };
  }

  /**
   * Bir kontrat icin aylik fatura ozetini hesaplar.
   * Disaridan (controller preview/monthly-fee) cagrildiginda kullanilir.
   */
  async calculateMonthlyFee(contractId: string): Promise<InvoiceSummary> {
    const { invoiceSummary } = await this.calculateAll(contractId);
    return invoiceSummary;
  }

  /**
   * Kontrat alt kalem toplamlarini hesaplar (saas, support, vb.)
   * Disaridan bagimsiz cagrildiginda kullanilir.
   */
  async calculateSubTotals(contractId: string): Promise<SubTotals> {
    const { subTotals } = await this.calculateAll(contractId);
    return subTotals;
  }

  /**
   * Yuklu veriden fatura ozeti olusturur (DB sorgusu yapmaz).
   */
  private async buildInvoiceSummary(
    contract: Contract | null,
    cashRegisters: ContractCashRegister[],
    supports: ContractSupport[],
    items: ContractItem[],
    saasItems: ContractSaas[],
    versions: ContractVersion[],
  ): Promise<InvoiceSummary> {
    const rows: InvoiceRow[] = [];

    // EFT-POS satirlari
    const noVat = contract?.noVat ?? false;
    const eftPosErpId = this.erpSettingsService.getErpId("eftPOS", noVat);
    const eftPosDescription = noVat
      ? EFTPOS_NO_VAT_DESCRIPTION
      : EFTPOS_DESCRIPTION;

    const eftPosRows = await this.groupAndProcess(
      cashRegisters.filter((o) => this.isBillable(o)),
      eftPosDescription,
      eftPosErpId,
      "eftpos",
    );
    rows.push(...eftPosRows);

    // Destek satirlari
    const supportErpId = this.erpSettingsService.getErpId("support");
    const supportRows = await this.groupAndProcess(
      supports.filter((o) => this.isBillable(o)),
      SUPPORT_DESCRIPTION,
      supportErpId,
      "support",
    );
    rows.push(...supportRows);

    // Surum satirlari
    const versionErpId = this.erpSettingsService.getErpId("version");
    const versionRows = await this.groupAndProcess(
      versions.filter((o) => this.isBillable(o)),
      VERSION_DESCRIPTION,
      versionErpId,
      "version",
    );
    rows.push(...versionRows);

    // Kalem satirlari (items - her birini ayri isle)
    const itemRows = await this.processItems(items.filter((o) => this.isBillable(o)));
    rows.push(...itemRows);

    // SaaS satirlari (batch product lookup ile)
    const saasRows = await this.processSaas(saasItems.filter((o) => this.isBillable(o)));
    rows.push(...saasRows);

    // Toplami 0 olan satirlari filtrele
    const filteredRows = rows.filter((r) => r.total !== 0);

    const total = this.safeRound(
      filteredRows.reduce((sum, r) => sum + r.total, 0),
    );

    return {
      id: generateShortId(),
      total,
      rows: filteredRows,
      support: supports,
      eftpos: cashRegisters,
      item: items,
      saas: saasItems,
      version: versions,
    };
  }

  /**
   * Yuklu veriden alt toplamlari hesaplar (DB sorgusu yapmaz).
   */
  private async buildSubTotals(
    cashRegisters: ContractCashRegister[],
    supports: ContractSupport[],
    items: ContractItem[],
    saasItems: ContractSaas[],
    versions: ContractVersion[],
  ): Promise<SubTotals> {
    const saasTotal = await this.calculateTotal(
      saasItems.filter((o) => this.isBillable(o)),
    );
    const supportTotal = await this.calculateTotal(
      supports.filter((o) => this.isBillable(o)),
    );
    const cashRegisterTotal = await this.calculateTotal(
      cashRegisters.filter((o) => this.isBillable(o)),
    );
    const itemsTotal = await this.calculateTotal(
      items.filter((o) => this.isBillable(o)),
      true,
    );
    const versionTotal = await this.calculateTotal(
      versions.filter((o) => this.isBillable(o)),
    );

    const oldSaasTotal = await this.calculateOldTotal(saasItems);
    const oldSupportTotal = await this.calculateOldTotal(supports);
    const oldCashRegisterTotal = await this.calculateOldTotal(cashRegisters);
    const oldItemsTotal = await this.calculateOldTotal(items);
    const oldVersionTotal = await this.calculateOldTotal(versions);
    const oldTotal =
      oldSaasTotal +
      oldSupportTotal +
      oldCashRegisterTotal +
      oldItemsTotal +
      oldVersionTotal;

    return {
      saasTotal,
      supportTotal,
      cashRegisterTotal,
      itemsTotal,
      versionTotal,
      oldSaasTotal,
      oldSupportTotal,
      oldCashRegisterTotal,
      oldItemsTotal,
      oldVersionTotal,
      oldTotal,
    };
  }

  /**
   * Fiyata gore gruplayip fatura satirlari olusturur.
   * Ayni fiyattaki kalemleri birlestirir.
   */
  private async groupAndProcess(
    data: Array<{ price: number; currency: string }>,
    description: string,
    itemId: string,
    category: InvoiceRowCategory,
  ): Promise<InvoiceRow[]> {
    const result: InvoiceRow[] = [];

    const grouped = data.reduce(
      (acc, item) => {
        const key = item.price.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, typeof data>,
    );

    for (const priceKey of Object.keys(grouped)) {
      const group = grouped[priceKey];
      const firstItem = group[0];
      const rate = await this.exchangeRateService.getRate(
        firstItem.currency as CurrencyType,
      );
      const rawPrice = Number(firstItem.price) || 0;
      const price = this.safeRound(rawPrice * rate);
      const count = group.length;
      const total = this.safeRound(price * count);

      result.push({
        id: generateShortId(),
        itemId,
        description,
        qty: count,
        unitPrice: price,
        total,
        category,
      });
    }

    return result;
  }

  /**
   * Kontrat kalemlerini (items) fatura satirlarina donusturur.
   */
  private async processItems(items: ContractItem[]): Promise<InvoiceRow[]> {
    const result: InvoiceRow[] = [];

    for (const item of items) {
      const rate = await this.exchangeRateService.getRate(
        item.currency as CurrencyType,
      );
      const rawPrice = Number(item.price) || 0;
      const price = this.safeRound(rawPrice * rate);
      const total = this.safeRound(price * (item.qty || 1));

      result.push({
        id: generateShortId(),
        itemId: item.erpId || "",
        description: item.description,
        qty: item.qty || 1,
        unitPrice: price,
        total,
        category: "item",
      });
    }

    return result;
  }

  /**
   * SaaS kalemlerini fatura satirlarina donusturur.
   * Tum product ID'lerini tek seferde batch olarak sorgular.
   */
  private async processSaas(saasItems: ContractSaas[]): Promise<InvoiceRow[]> {
    if (saasItems.length === 0) return [];

    // Tum product ID'lerini tek sorguda cek
    const productIds = saasItems
      .map((s) => s.productId)
      .filter((id): id is string => !!id);

    const products =
      productIds.length > 0
        ? await this.softwareProductModel
            .find({ id: { $in: productIds } })
            .lean()
            .exec()
        : [];

    const productMap = new Map(products.map((p) => [p.id, p.erpId || ""]));

    const result: InvoiceRow[] = [];

    for (const saasItem of saasItems) {
      const rate = await this.exchangeRateService.getRate(
        saasItem.currency as CurrencyType,
      );
      const rawPrice = Number(saasItem.price) || 0;
      const price = this.safeRound(rawPrice * rate);
      const total = this.safeRound(price * (saasItem.qty || 1));

      const erpId = saasItem.productId
        ? productMap.get(saasItem.productId) || ""
        : "";

      result.push({
        id: generateShortId(),
        itemId: erpId,
        description: `${saasItem.description} (${saasItem.licanceId})`,
        qty: saasItem.qty || 1,
        unitPrice: price,
        total,
        category: "saas",
      });
    }

    return result;
  }

  /**
   * Fiyatlari TL'ye cevirip toplam hesaplar.
   * useQty true ise qty ile carpar (items icin).
   */
  private async calculateTotal(
    data: Array<{ price: number; currency: string; qty?: number }>,
    useQty = false,
  ): Promise<number> {
    let sum = 0;
    for (const item of data) {
      const price = Number(item.price) || 0;
      const rate = await this.exchangeRateService.getRate(
        item.currency as CurrencyType,
      );
      const multiplier = useQty ? item.qty || 1 : 1;
      sum += price * rate * multiplier;
    }
    return this.safeRound(sum);
  }

  /**
   * Eski fiyat toplamlarini hesaplar (old_price kullanir)
   */
  private async calculateOldTotal(
    data: Array<{
      old_price: number;
      currency: string;
      qty?: number;
      enabled: boolean;
    }>,
  ): Promise<number> {
    const enabledItems = data.filter((d) => d.enabled);
    if (enabledItems.length === 0) return 0;

    let sum = 0;
    for (const item of enabledItems) {
      const oldPrice = Number(item.old_price) || 0;
      const rate = await this.exchangeRateService.getRate(
        item.currency as CurrencyType,
      );
      sum += oldPrice * rate * (item.qty || 1);
    }
    return this.safeRound(sum);
  }

  /**
   * Bir kalemin faturalanabilir olup olmadigini kontrol eder.
   * Faturalama kosulu: enabled VE expired degil.
   * Not: activated alani deploy/aktivasyon takibi icindir,
   * odeme plani hesaplamasini etkilemez.
   */
  private isBillable(item: { enabled: boolean; expired?: boolean }): boolean {
    return item.enabled && !(item.expired ?? false);
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }
}
