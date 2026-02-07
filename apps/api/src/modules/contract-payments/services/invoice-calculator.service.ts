import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExchangeRateService } from "../../exchange-rate";
import { ErpSettingsService } from "../../erp-settings";
import { InvoiceRow, InvoiceSummary, CurrencyType } from "../interfaces/payment-plan.interfaces";
import { ContractCashRegister, ContractCashRegisterDocument } from "../../contract-cash-registers/schemas/contract-cash-register.schema";
import { ContractSupport, ContractSupportDocument } from "../../contract-supports/schemas/contract-support.schema";
import { ContractItem, ContractItemDocument } from "../../contract-items/schemas/contract-item.schema";
import { ContractSaas, ContractSaasDocument } from "../../contract-saas/schemas/contract-saas.schema";
import { ContractVersion, ContractVersionDocument } from "../../contract-versions/schemas/contract-version.schema";
import { SoftwareProduct, SoftwareProductDocument } from "../../software-products/schemas/software-product.schema";
import { Contract, ContractDocument } from "../../contracts/schemas/contract.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

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
   * Bir kontrat icin aylik fatura ozetini hesaplar.
   * io-cloud-2025 calculateMonthlyFee() metodunun NestJS karsiligi.
   */
  async calculateMonthlyFee(contractId: string): Promise<InvoiceSummary> {
    const contract = await this.contractModel
      .findOne({ id: contractId })
      .lean()
      .exec();

    const [cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.cashRegisterModel.find({ contractId }).lean().exec(),
        this.supportModel.find({ contractId }).lean().exec(),
        this.itemModel.find({ contractId }).lean().exec(),
        this.saasModel.find({ contractId }).lean().exec(),
        this.versionModel.find({ contractId }).lean().exec(),
      ]);

    const rows: InvoiceRow[] = [];

    // EFT-POS satirlari
    const noVat = contract?.noVat ?? false;
    const eftPosErpId = this.erpSettingsService.getErpId("eftPOS", noVat);
    const eftPosDescription = noVat
      ? "EFT-POS ENTEGRASYON API (ORWI)"
      : "EFT-POS ENTEGRASYON HİZMETİ";

    const eftPosRows = await this.groupAndProcess(
      cashRegisters.filter((o) => o.enabled),
      eftPosDescription,
      eftPosErpId,
    );
    rows.push(...eftPosRows);

    // Destek satirlari
    const supportErpId = this.erpSettingsService.getErpId("support");
    const supportRows = await this.groupAndProcess(
      supports.filter((o) => o.enabled),
      "KERZZ ONLİNE HİZMETLER VE ÇAĞRI MERKEZİ PAKETİ",
      supportErpId,
    );
    rows.push(...supportRows);

    // Surum satirlari
    const versionErpId = this.erpSettingsService.getErpId("version");
    const versionRows = await this.groupAndProcess(
      versions.filter((o) => o.enabled),
      "SÜRÜM YENİLEME HİZMETİ",
      versionErpId,
    );
    rows.push(...versionRows);

    // Kalem satirlari (items - her birini ayri isle)
    const itemRows = await this.processItems(items.filter((o) => o.enabled));
    rows.push(...itemRows);

    // SaaS satirlari (her birini ayri isle)
    const saasRows = await this.processSaas(saasItems.filter((o) => o.enabled));
    rows.push(...saasRows);

    // Toplami 0 olan satirlari filtrele
    const filteredRows = rows.filter((r) => r.total !== 0);

    const total = this.roundTwo(
      filteredRows.reduce((sum, r) => sum + r.total, 0),
    );

    const summary: InvoiceSummary = {
      id: this.generateId(),
      total,
      rows: filteredRows,
      support: supports,
      eftpos: cashRegisters,
      item: items,
      saas: saasItems,
      version: versions,
    };

    return summary;
  }

  /**
   * Fiyata gore gruplayip fatura satirlari olusturur.
   * Ayni fiyattaki kalemleri birlestirir.
   */
  private async groupAndProcess(
    data: Array<{ price: number; currency: string }>,
    description: string,
    itemId: string,
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
      const price = this.roundTwo(rawPrice * rate);
      const count = group.length;
      const total = this.roundTwo(price * count);

      result.push({
        id: this.generateId(),
        itemId,
        description,
        qty: count,
        unitPrice: price,
        total,
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
      const price = this.roundTwo(rawPrice * rate);
      const total = this.roundTwo(price * (item.qty || 1));

      result.push({
        id: this.generateId(),
        itemId: item.erpId || "",
        description: item.description,
        qty: item.qty || 1,
        unitPrice: price,
        total,
      });
    }

    return result;
  }

  /**
   * SaaS kalemlerini fatura satirlarina donusturur.
   */
  private async processSaas(saasItems: ContractSaas[]): Promise<InvoiceRow[]> {
    const result: InvoiceRow[] = [];

    for (const saasItem of saasItems) {
      const rate = await this.exchangeRateService.getRate(
        saasItem.currency as CurrencyType,
      );
      const rawPrice = Number(saasItem.price) || 0;
      const price = this.roundTwo(rawPrice * rate);
      const total = this.roundTwo(price * (saasItem.qty || 1));

      // SoftwareProduct'tan erpId bul
      let erpId = "";
      if (saasItem.productId) {
        const product = await this.softwareProductModel
          .findOne({ id: saasItem.productId })
          .lean()
          .exec();
        erpId = product?.erpId || "";
      }

      result.push({
        id: this.generateId(),
        itemId: erpId,
        description: `${saasItem.description} (${saasItem.licanceId})`,
        qty: saasItem.qty || 1,
        unitPrice: price,
        total,
      });
    }

    return result;
  }

  /**
   * Kontrat alt kalem toplamlarini hesaplar (saas, support, vb.)
   */
  async calculateSubTotals(contractId: string): Promise<{
    saasTotal: number;
    supportTotal: number;
    cashRegisterTotal: number;
    itemsTotal: number;
    versionTotal: number;
    oldSaasTotal: number;
    oldSupportTotal: number;
    oldCashRegisterTotal: number;
    oldItemsTotal: number;
    oldVersionTotal: number;
    oldTotal: number;
  }> {
    const [cashRegisters, supports, items, saasItems, versions] =
      await Promise.all([
        this.cashRegisterModel.find({ contractId }).lean().exec(),
        this.supportModel.find({ contractId }).lean().exec(),
        this.itemModel.find({ contractId }).lean().exec(),
        this.saasModel.find({ contractId }).lean().exec(),
        this.versionModel.find({ contractId }).lean().exec(),
      ]);

    const saasTotal = await this.calculateTotal(saasItems.filter((o) => o.enabled));
    const supportTotal = await this.calculateTotal(supports.filter((o) => o.enabled));
    const cashRegisterTotal = await this.calculateTotal(cashRegisters.filter((o) => o.enabled));
    const itemsTotal = await this.calculateItemsTotal(items.filter((o) => o.enabled));
    const versionTotal = await this.calculateTotal(versions.filter((o) => o.enabled));

    const oldSaasTotal = await this.calculateOldTotal(saasItems);
    const oldSupportTotal = await this.calculateOldTotal(supports);
    const oldCashRegisterTotal = await this.calculateOldTotal(cashRegisters);
    const oldItemsTotal = await this.calculateOldTotal(items);
    const oldVersionTotal = await this.calculateOldTotal(versions);
    const oldTotal = oldSaasTotal + oldSupportTotal + oldCashRegisterTotal + oldItemsTotal + oldVersionTotal;

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
   * Fiyatlari TL'ye cevirip toplam hesaplar
   */
  private async calculateTotal(
    data: Array<{ price: number; currency: string }>,
  ): Promise<number> {
    let sum = 0;
    for (const item of data) {
      const price = Number(item.price) || 0;
      const rate = await this.exchangeRateService.getRate(
        item.currency as CurrencyType,
      );
      sum += price * rate;
    }
    return this.safeRound(sum);
  }

  /**
   * Items icin qty ile carparak toplam hesaplar
   */
  private async calculateItemsTotal(
    data: Array<{ price: number; currency: string; qty?: number }>,
  ): Promise<number> {
    let sum = 0;
    for (const item of data) {
      const price = Number(item.price) || 0;
      const rate = await this.exchangeRateService.getRate(
        item.currency as CurrencyType,
      );
      sum += price * rate * (item.qty || 1);
    }
    return this.safeRound(sum);
  }

  /**
   * Eski fiyat toplamlarini hesaplar (old_price kullanir)
   */
  private async calculateOldTotal(
    data: Array<{ old_price: number; currency: string; qty?: number; enabled: boolean }>,
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

  private roundTwo(value: number): number {
    return this.safeRound(value);
  }

  private safeRound(value: number): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    return parseFloat(value.toFixed(2));
  }

  private generateId(): string {
    return crypto.randomUUID().substring(0, 8);
  }
}
