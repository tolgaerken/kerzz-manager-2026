import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ContractCashRegister, ContractCashRegisterDocument } from "./schemas/contract-cash-register.schema";
import {
  ContractCashRegisterQueryDto,
  CreateContractCashRegisterDto,
  UpdateContractCashRegisterDto,
  ContractCashRegisterResponseDto,
  ContractCashRegistersListResponseDto,
  CashRegisterStatsQueryDto,
  CashRegisterStatsDto,
  CurrencyBreakdownDto,
  TimePeriodStatsDto,
  ModelStatDto,
  MonthlyTrendDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";
import { EFTPOS_DESCRIPTION } from "../contract-payments/constants/invoice.constants";

@Injectable()
export class ContractCashRegistersService {
  private readonly logger = new Logger(ContractCashRegistersService.name);

  constructor(
    @InjectModel(ContractCashRegister.name, CONTRACT_DB_CONNECTION)
    private contractCashRegisterModel: Model<ContractCashRegisterDocument>,
    private readonly proratedPlanService: ProratedPlanService,
  ) {}

  async findAll(query: ContractCashRegisterQueryDto): Promise<ContractCashRegistersListResponseDto> {
    const { contractId, enabled, type, activated } = query;

    const filter: Record<string, unknown> = {};
    if (contractId) {
      filter.contractId = contractId;
    }
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }
    if (type) {
      filter.type = type;
    }
    if (activated !== undefined) {
      filter.activated = activated;
    }

    const [data, total] = await Promise.all([
      this.contractCashRegisterModel.find(filter).lean().exec(),
      this.contractCashRegisterModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractCashRegisterResponseDto> {
    const cashRegister = await this.findByIdentifier(id);
    if (!cashRegister) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }
    return this.mapToResponseDto(cashRegister);
  }

  async create(dto: CreateContractCashRegisterDto): Promise<ContractCashRegisterResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const cashRegister = new this.contractCashRegisterModel({
      ...dto,
      id,
      enabled: true,
      expired: false,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      activated: false,
      editDate: now,
      editUser: "system"
    });

    const saved = await cashRegister.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractCashRegisterDto): Promise<ContractCashRegisterResponseDto> {
    const filter = await this.resolveFilter(id);
    // activated true geldiyse: once diger alanlari kaydet, sonra aktivasyon mantığını calistir
    if (dto.activated === true) {
      const existing = await this.contractCashRegisterModel.findOne(filter).lean().exec();
      if (!existing) {
        throw new NotFoundException(`Contract cash register with id ${id} not found`);
      }

      if (!existing.activated) {
        // Aktivasyon disindaki alanlari (startDate, price vb.) once kaydet
        const { activated, ...otherFields } = dto;
        if (Object.keys(otherFields).length > 0) {
          await this.contractCashRegisterModel
            .findOneAndUpdate(
              filter,
              { ...otherFields, editDate: new Date() },
              { new: true },
            )
            .lean()
            .exec();
        }

        return this.activate(id);
      }
    }

    // activated false geldiyse: faturalanmamis kist planini sil
    if (dto.activated === false) {
      const existing = await this.contractCashRegisterModel.findOne(filter).lean().exec();
      if (existing?.activated) {
        await this.proratedPlanService.deleteUninvoicedBySourceItem(existing.contractId, existing.id);
      }
    }

    const updated = await this.contractCashRegisterModel
      .findOneAndUpdate(
        filter,
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const filter = await this.resolveFilter(id);
    // Silmeden once kalemi bul (contractId icin)
    const item = await this.contractCashRegisterModel.findOne(filter).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }

    // Faturalanmamis kist plani sil
    await this.proratedPlanService.deleteUninvoicedBySourceItem(item.contractId, item.id);

    // Kalemi sil
    await this.contractCashRegisterModel.deleteOne(filter).exec();
  }

  /**
   * Kalemi aktive eder (kuruldu/devreye alindi).
   * startDate gunceller ve kist plan olusturur.
   */
  async activate(id: string): Promise<ContractCashRegisterResponseDto> {
    const filter = await this.resolveFilter(id);
    const item = await this.contractCashRegisterModel.findOne(filter).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }
    if (item.activated) {
      throw new BadRequestException("Bu kalem zaten aktive edilmis");
    }

    const now = new Date();

    const updateData: Record<string, unknown> = {
      activated: true,
      activatedAt: now,
      editDate: now,
    };

    // startDate henuz set edilmemisse bugune guncelle
    if (!item.startDate) {
      updateData.startDate = now;
    }

    const updated = await this.contractCashRegisterModel
      .findOneAndUpdate(filter, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract cash register with id ${id} not found`);
    }

    // Kist plan olustur (ayin 1'i degilse)
    // NOT: Yazarkasa icin gun hesabi yapilmaz - her zaman tam aylik ucret
    const startDate = (updateData.startDate as Date) || item.startDate;
    const startDateObj = new Date(startDate);

    if (startDateObj.getUTCDate() !== 1) {
      await this.proratedPlanService.createProratedPlan(
        item.contractId,
        {
          price: item.price,
          currency: item.currency,
          startDate: startDateObj,
          sourceItemId: item.id,
        },
        EFTPOS_DESCRIPTION,
        { skipDayCalculation: true },
      );
    }

    return this.mapToResponseDto(updated);
  }

  private async findByIdentifier(identifier: string) {
    const byId = await this.contractCashRegisterModel.findOne({ id: identifier }).lean().exec();
    if (byId) return byId;

    if (Types.ObjectId.isValid(identifier)) {
      return this.contractCashRegisterModel.findOne({ _id: identifier }).lean().exec();
    }

    return null;
  }

  private async resolveFilter(identifier: string): Promise<Record<string, unknown>> {
    const byId = await this.contractCashRegisterModel.exists({ id: identifier }).exec();
    if (byId) return { id: identifier };

    if (Types.ObjectId.isValid(identifier)) {
      const byObjectId = await this.contractCashRegisterModel.exists({ _id: identifier }).exec();
      if (byObjectId) return { _id: identifier };
    }

    return { id: identifier };
  }

  private mapToResponseDto(cr: ContractCashRegister): ContractCashRegisterResponseDto {
    return {
      _id: cr._id.toString(),
      id: cr.id,
      contractId: cr.contractId,
      brand: cr.brand || "",
      licanceId: cr.licanceId || "",
      legalId: cr.legalId || "",
      model: cr.model || "",
      type: cr.type || "gmp",
      price: cr.price || 0,
      old_price: cr.old_price || 0,
      currency: cr.currency || "tl",
      yearly: cr.yearly || false,
      enabled: cr.enabled ?? true,
      expired: cr.expired || false,
      eftPosActive: cr.eftPosActive || false,
      folioClose: cr.folioClose || false,
      startDate: cr.startDate,
      activated: cr.activated || false,
      activatedAt: cr.activatedAt,
      editDate: cr.editDate,
      editUser: cr.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }

  // ─── Stats Metodu ────────────────────────────────────────────

  async getStats(query: CashRegisterStatsQueryDto): Promise<CashRegisterStatsDto> {
    const { contractId } = query;

    const now = new Date();
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));

    // Base filter
    const baseFilter: Record<string, unknown> = {};
    if (contractId) {
      baseFilter.contractId = contractId;
    }

    // Aktif kayıtlar için filter
    const activeFilter = {
      ...baseFilter,
      enabled: true,
      expired: false
    };

    // Paralel sorgular
    const [
      totalCount,
      activeCount,
      tsmCount,
      gmpCount,
      yearlyCount,
      monthlyCount,
      todayStats,
      thisMonthStats,
      thisYearStats,
      yearlyPriceStats,
      monthlyPriceStats,
      modelStats,
      monthlyTrendStats
    ] = await Promise.all([
      // Toplam kayıt
      this.contractCashRegisterModel.countDocuments(baseFilter).exec(),

      // Aktif kayıt
      this.contractCashRegisterModel.countDocuments(activeFilter).exec(),

      // TSM sayısı
      this.contractCashRegisterModel.countDocuments({ ...activeFilter, type: "tsm" }).exec(),

      // GMP sayısı
      this.contractCashRegisterModel.countDocuments({ ...activeFilter, type: "gmp" }).exec(),

      // Yıllık ödeme
      this.contractCashRegisterModel.countDocuments({ ...activeFilter, yearly: true }).exec(),

      // Aylık ödeme
      this.contractCashRegisterModel.countDocuments({ ...activeFilter, yearly: false }).exec(),

      // Bugün eklenenler
      this.getTimePeriodStats(activeFilter, todayStart),

      // Bu ay eklenenler
      this.getTimePeriodStats(activeFilter, monthStart),

      // Bu yıl eklenenler
      this.getTimePeriodStats(activeFilter, yearStart),

      // Yıllık fiyat toplamları (currency bazlı)
      this.getCurrencyPriceStats({ ...activeFilter, yearly: true }),

      // Aylık fiyat toplamları (currency bazlı)
      this.getCurrencyPriceStats({ ...activeFilter, yearly: false }),

      // Model dağılımı
      this.getModelDistribution(activeFilter),

      // Aylık trend (son 12 ay)
      this.getMonthlyTrend(activeFilter, now)
    ]);

    const passive = totalCount - activeCount;

    return {
      total: totalCount,
      active: activeCount,
      passive,
      tsm: tsmCount,
      gmp: gmpCount,
      yearly: yearlyCount,
      monthly: monthlyCount,
      yearlyByPrice: yearlyPriceStats,
      monthlyByPrice: monthlyPriceStats,
      today: todayStats,
      thisMonth: thisMonthStats,
      thisYear: thisYearStats,
      modelDistribution: modelStats,
      monthlyTrend: monthlyTrendStats
    };
  }

  private async getTimePeriodStats(
    baseFilter: Record<string, unknown>,
    startDate: Date
  ): Promise<TimePeriodStatsDto> {
    const filter = {
      ...baseFilter,
      firstRegister: { $exists: true, $gte: startDate }
    };

    const result = await this.contractCashRegisterModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$currency",
          count: { $sum: 1 },
          totalPrice: { $sum: "$price" }
        }
      }
    ]).exec();

    const currencyCounts = { tl: 0, usd: 0, eur: 0 };
    const currencyTotals = { tl: 0, usd: 0, eur: 0 };
    let totalCount = 0;

    for (const item of result) {
      const currency = item._id as keyof CurrencyBreakdownDto;
      if (currency in currencyCounts) {
        currencyCounts[currency] = item.count;
        currencyTotals[currency] = item.totalPrice;
        totalCount += item.count;
      }
    }

    return {
      count: totalCount,
      currencyCounts,
      currencyTotals
    };
  }

  private async getCurrencyPriceStats(
    filter: Record<string, unknown>
  ): Promise<CurrencyBreakdownDto> {
    const result = await this.contractCashRegisterModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$price" }
        }
      }
    ]).exec();

    const totals: CurrencyBreakdownDto = { tl: 0, usd: 0, eur: 0 };

    for (const item of result) {
      const currency = item._id as keyof CurrencyBreakdownDto;
      if (currency in totals) {
        totals[currency] = item.total;
      }
    }

    return totals;
  }

  private async getModelDistribution(
    filter: Record<string, unknown>
  ): Promise<ModelStatDto[]> {
    const result = await this.contractCashRegisterModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$model",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).exec();

    return result.map(item => ({
      modelId: item._id || "unknown",
      count: item.count
    }));
  }

  private async getMonthlyTrend(
    filter: Record<string, unknown>,
    now: Date
  ): Promise<MonthlyTrendDto[]> {
    const months: MonthlyTrendDto[] = [];

    // Son 12 ay için boş array oluştur
    for (let i = 11; i >= 0; i--) {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      months.push({ month: monthKey, count: 0 });
    }

    // Her ay için kayıt sayısını hesapla
    const results = await Promise.all(
      months.map(async (m) => {
        const [year, month] = m.month.split("-").map(Number);
        const monthStart = new Date(Date.UTC(year, month - 1, 1));
        const monthEnd = new Date(Date.UTC(year, month, 1));

        const count = await this.contractCashRegisterModel.countDocuments({
          ...filter,
          firstRegister: {
            $exists: true,
            $gte: monthStart,
            $lt: monthEnd
          }
        }).exec();

        return { month: m.month, count };
      })
    );

    return results;
  }
}
