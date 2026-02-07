import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ErpSetting, ErpSettingDocument } from "./schemas/erp-setting.schema";
import { CreateErpSettingDto, UpdateErpSettingDto, ErpSettingResponseDto } from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

/** Varsayilan ERP stok kodlari (seed data) */
const DEFAULT_ERP_SETTINGS: CreateErpSettingDto[] = [
  { key: "eftPOS", erpId: "B021", description: "EFT-POS Entegrasyon Hizmeti", noVatErpId: "P033" },
  { key: "support", erpId: "B072", description: "Kerzz Online Hizmetler ve Cagri Merkezi Paketi" },
  { key: "version", erpId: "B090", description: "Surum Yenileme Hizmeti" },
  { key: "cloud", erpId: "B084", description: "Bulut Hizmeti" },
  { key: "boss", erpId: "B098", description: "Boss Hizmeti" },
  { key: "alpemix", erpId: "B086", description: "Alpemix Hizmeti" },
  { key: "fiyuu", erpId: "B033", description: "Fiyuu Hizmeti" },
  { key: "yazarkasaDevre", erpId: "B004", description: "Yazar Kasa Devreye Alma" },
  { key: "eInvoiceCreditItem", erpId: "9b71-6d6c", description: "E-Fatura Kredi Kalemi" },
];

@Injectable()
export class ErpSettingsService implements OnModuleInit {
  private readonly logger = new Logger(ErpSettingsService.name);
  private settingsCache: Map<string, ErpSetting> = new Map();

  constructor(
    @InjectModel(ErpSetting.name, CONTRACT_DB_CONNECTION)
    private erpSettingModel: Model<ErpSettingDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
    await this.refreshCache();
  }

  /**
   * Tum ERP ayarlarini listeler
   */
  async findAll(): Promise<ErpSettingResponseDto[]> {
    const data = await this.erpSettingModel.find().lean().exec();
    return data.map((doc) => this.mapToResponseDto(doc));
  }

  /**
   * Key bazli ERP stok kodunu dondurur (cache'den).
   * noVat true ise ve noVatErpId varsa onu dondurur.
   */
  getErpId(key: string, noVat = false): string {
    const setting = this.settingsCache.get(key);
    if (!setting) {
      this.logger.warn(`ERP setting not found for key: ${key}`);
      return "";
    }
    if (noVat && setting.noVatErpId) {
      return setting.noVatErpId;
    }
    return setting.erpId;
  }

  async create(dto: CreateErpSettingDto): Promise<ErpSettingResponseDto> {
    const setting = new this.erpSettingModel(dto);
    const saved = await setting.save();
    await this.refreshCache();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(key: string, dto: UpdateErpSettingDto): Promise<ErpSettingResponseDto> {
    const updated = await this.erpSettingModel
      .findOneAndUpdate({ key }, dto, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`ERP setting with key ${key} not found`);
    }

    await this.refreshCache();
    return this.mapToResponseDto(updated);
  }

  async delete(key: string): Promise<void> {
    const result = await this.erpSettingModel.deleteOne({ key }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`ERP setting with key ${key} not found`);
    }
    await this.refreshCache();
  }

  /**
   * Veritabaninda yoksa varsayilan ayarlari ekler
   */
  private async seedDefaults(): Promise<void> {
    const existingCount = await this.erpSettingModel.countDocuments().exec();
    if (existingCount > 0) {
      this.logger.log(`ERP settings already seeded (${existingCount} records)`);
      return;
    }

    await this.erpSettingModel.insertMany(DEFAULT_ERP_SETTINGS);
    this.logger.log(`Seeded ${DEFAULT_ERP_SETTINGS.length} default ERP settings`);
  }

  /**
   * Veritabanindan tum ayarlari cache'e yukler
   */
  private async refreshCache(): Promise<void> {
    const settings = await this.erpSettingModel.find().lean().exec();
    this.settingsCache.clear();
    for (const s of settings) {
      this.settingsCache.set(s.key, s);
    }
    this.logger.log(`ERP settings cache refreshed (${settings.length} items)`);
  }

  private mapToResponseDto(setting: ErpSetting): ErpSettingResponseDto {
    return {
      _id: setting._id.toString(),
      key: setting.key,
      erpId: setting.erpId,
      description: setting.description || "",
      noVatErpId: setting.noVatErpId || "",
    };
  }
}
