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

/** Doviz kuru haritasi - hesaplama basinda bir kez olusturulur */
type RateMap = Record<CurrencyType, number>;
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
import { safeRound } from "../utils/math.utils";
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

    // Doviz kurlarini tek seferde al (tum hesaplamalarda kullanilacak)
    const rateMap = await this.buildRateMap();

    const invoiceSummary = await this.buildInvoiceSummary(
      contract,
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
      rateMap,
    );

    // Guncel toplamlari invoice rows'tan turet (ayni hesaplamayi tekrarlama)
    const currentTotals = this.deriveCurrentTotals(invoiceSummary.rows);

    // Eski fiyat toplamlarini ayri hesapla (invoice rows'ta yok)
    const oldTotals = this.buildOldTotals(
      cashRegisters,
      supports,
      items,
      saasItems,
      versions,
      rateMap,
    );

    const subTotals: SubTotals = { ...currentTotals, ...oldTotals };

    return { invoiceSummary, subTotals };
  }

  /**
   * Doviz kurlarini tek seferde alir ve RateMap olarak dondurur.
   */
  private async buildRateMap(): Promise<RateMap> {
    const { usd, eur } = await this.exchangeRateService.getRates();
    return { tl: 1, usd, eur };
  }

  /**
   * Invoice rows'tan guncel kategori toplamlarini turetir.
   * buildInvoiceSummary zaten hesapladigi icin tekrar hesaplama yapmaz.
   */
  private deriveCurrentTotals(rows: InvoiceRow[]): {
    saasTotal: number;
    supportTotal: number;
    cashRegisterTotal: number;
    itemsTotal: number;
    versionTotal: number;
  } {
    let saasTotal = 0;
    let supportTotal = 0;
    let cashRegisterTotal = 0;
    let itemsTotal = 0;
    let versionTotal = 0;

    for (const row of rows) {
      switch (row.category) {
        case "saas":
          saasTotal += row.total;
          break;
        case "support":
          supportTotal += row.total;
          break;
        case "eftpos":
          cashRegisterTotal += row.total;
          break;
        case "item":
          itemsTotal += row.total;
          break;
        case "version":
          versionTotal += row.total;
          break;
      }
    }

    return {
      saasTotal: safeRound(saasTotal),
      supportTotal: safeRound(supportTotal),
      cashRegisterTotal: safeRound(cashRegisterTotal),
      itemsTotal: safeRound(itemsTotal),
      versionTotal: safeRound(versionTotal),
    };
  }

  /**
   * Eski fiyat toplamlarini hesaplar (old_price kullanir).
   * Guncel toplamlar invoice rows'tan turetildigi icin sadece eski fiyatlar hesaplanir.
   */
  private buildOldTotals(
    cashRegisters: ContractCashRegister[],
    supports: ContractSupport[],
    items: ContractItem[],
    saasItems: ContractSaas[],
    versions: ContractVersion[],
    rateMap: RateMap,
  ): {
    oldSaasTotal: number;
    oldSupportTotal: number;
    oldCashRegisterTotal: number;
    oldItemsTotal: number;
    oldVersionTotal: number;
    oldTotal: number;
  } {
    const oldSaasTotal = this.calculateOldTotal(saasItems, rateMap);
    const oldSupportTotal = this.calculateOldTotal(supports, rateMap);
    const oldCashRegisterTotal = this.calculateOldTotal(cashRegisters, rateMap);
    const oldItemsTotal = this.calculateOldTotal(items, rateMap);
    const oldVersionTotal = this.calculateOldTotal(versions, rateMap);
    const oldTotal =
      oldSaasTotal +
      oldSupportTotal +
      oldCashRegisterTotal +
      oldItemsTotal +
      oldVersionTotal;

    return {
      oldSaasTotal,
      oldSupportTotal,
      oldCashRegisterTotal,
      oldItemsTotal,
      oldVersionTotal,
      oldTotal,
    };
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
    rateMap: RateMap,
  ): Promise<InvoiceSummary> {
    const rows: InvoiceRow[] = [];

    // EFT-POS satirlari
    const noVat = contract?.noVat ?? false;
    const eftPosErpId = this.erpSettingsService.getErpId("eftPOS", noVat);
    const eftPosDescription = noVat
      ? EFTPOS_NO_VAT_DESCRIPTION
      : EFTPOS_DESCRIPTION;

    const eftPosRows = this.groupAndProcess(
      cashRegisters.filter((o) => this.isBillable(o)),
      eftPosDescription,
      eftPosErpId,
      "eftpos",
      rateMap,
    );
    rows.push(...eftPosRows);

    // Destek satirlari
    const supportErpId = this.erpSettingsService.getErpId("support");
    const supportRows = this.groupAndProcess(
      supports.filter((o) => this.isBillable(o)),
      SUPPORT_DESCRIPTION,
      supportErpId,
      "support",
      rateMap,
    );
    rows.push(...supportRows);

    // Surum satirlari
    const versionErpId = this.erpSettingsService.getErpId("version");
    const versionRows = this.groupAndProcess(
      versions.filter((o) => this.isBillable(o)),
      VERSION_DESCRIPTION,
      versionErpId,
      "version",
      rateMap,
    );
    rows.push(...versionRows);

    // Kalem satirlari (items - her birini ayri isle)
    const itemRows = this.processItems(items.filter((o) => this.isBillable(o)), rateMap);
    rows.push(...itemRows);

    // SaaS satirlari (batch product lookup ile)
    const saasRows = await this.processSaas(saasItems.filter((o) => this.isBillable(o)), rateMap);
    rows.push(...saasRows);

    // Toplami 0 olan satirlari filtrele
    const filteredRows = rows.filter((r) => r.total !== 0);

    const total = safeRound(
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
   * Fiyata gore gruplayip fatura satirlari olusturur.
   * Ayni fiyattaki kalemleri birlestirir.
   */
  private groupAndProcess(
    data: Array<{ price: number; currency: string }>,
    description: string,
    itemId: string,
    category: InvoiceRowCategory,
    rateMap: RateMap,
  ): InvoiceRow[] {
    const result: InvoiceRow[] = [];

    const grouped = data.reduce(
      (acc, item) => {
        // Fiyat + para birimi ile grupla (farkli dovizlerin karismasini onle)
        const key = `${item.price}-${item.currency}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      },
      {} as Record<string, typeof data>,
    );

    for (const priceKey of Object.keys(grouped)) {
      const group = grouped[priceKey];
      const firstItem = group[0];
      const rate = rateMap[firstItem.currency as CurrencyType] ?? 1;
      const rawPrice = Number(firstItem.price) || 0;
      const price = safeRound(rawPrice * rate);
      const count = group.length;
      const total = safeRound(price * count);

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
  private processItems(items: ContractItem[], rateMap: RateMap): InvoiceRow[] {
    const result: InvoiceRow[] = [];

    for (const item of items) {
      const rate = rateMap[item.currency as CurrencyType] ?? 1;
      const rawPrice = Number(item.price) || 0;
      const price = safeRound(rawPrice * rate);
      const total = safeRound(price * (item.qty || 1));

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
  private async processSaas(saasItems: ContractSaas[], rateMap: RateMap): Promise<InvoiceRow[]> {
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
      const rate = rateMap[saasItem.currency as CurrencyType] ?? 1;
      const rawPrice = Number(saasItem.price) || 0;
      const price = safeRound(rawPrice * rate);
      const total = safeRound(price * (saasItem.qty || 1));

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
   * Eski fiyat toplamlarini hesaplar (old_price kullanir)
   */
  private calculateOldTotal(
    data: Array<{
      old_price: number;
      currency: string;
      qty?: number;
      enabled: boolean;
    }>,
    rateMap: RateMap,
  ): number {
    const enabledItems = data.filter((d) => d.enabled);
    if (enabledItems.length === 0) return 0;

    let sum = 0;
    for (const item of enabledItems) {
      const oldPrice = Number(item.old_price) || 0;
      const rate = rateMap[item.currency as CurrencyType] ?? 1;
      sum += oldPrice * rate * (item.qty || 1);
    }
    return safeRound(sum);
  }

  /**
   * Bir kalemin faturalanabilir olup olmadigini kontrol eder.
   * Faturalama kosulu: enabled olmasi yeterli.
   * Not: expired alani kontrat suresi dolmus kalemleri isaretler ancak
   * odeme plani hesaplamasini etkilemez (kontrat suresi boyunca faturalanir).
   * activated alani deploy/aktivasyon takibi icindir, hesaplamayi etkilemez.
   */
  private isBillable(item: { enabled: boolean }): boolean {
    return item.enabled;
  }

}
