import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractSupport, ContractSupportDocument } from "./schemas/contract-support.schema";
import {
  ContractSupportQueryDto,
  CreateContractSupportDto,
  UpdateContractSupportDto,
  ContractSupportResponseDto,
  ContractSupportsListResponseDto,
  SupportsStatsQueryDto,
  SupportsStatsDto,
  CurrencyBreakdownDto,
  TimePeriodStatsDto,
  TypeCountsDto,
  MonthlyTrendDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";
import { SUPPORT_DESCRIPTION } from "../contract-payments/constants/invoice.constants";

@Injectable()
export class ContractSupportsService {
  constructor(
    @InjectModel(ContractSupport.name, CONTRACT_DB_CONNECTION)
    private contractSupportModel: Model<ContractSupportDocument>,
    private readonly proratedPlanService: ProratedPlanService,
  ) {}

  async findAll(query: ContractSupportQueryDto): Promise<ContractSupportsListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = {};
    if (contractId) {
      filter.contractId = contractId;
    }
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractSupportModel.find(filter).lean().exec(),
      this.contractSupportModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractSupportResponseDto> {
    const support = await this.contractSupportModel.findOne({ id }).lean().exec();
    if (!support) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }
    return this.mapToResponseDto(support);
  }

  async create(dto: CreateContractSupportDto): Promise<ContractSupportResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const support = new this.contractSupportModel({
      ...dto,
      id,
      enabled: true,
      expired: false,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      activated: false,
      editDate: now,
      editUser: "system"
    });

    const saved = await support.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractSupportDto): Promise<ContractSupportResponseDto> {
    // activated true geldiyse aktivasyon mantığını çalıştır
    if (dto.activated === true) {
      const existing = await this.contractSupportModel.findOne({ id }).lean().exec();
      if (!existing) {
        throw new NotFoundException(`Contract support with id ${id} not found`);
      }
      if (!existing.activated) {
        return this.activate(id);
      }
    }

    // activated false geldiyse: faturalanmamis kist planini sil
    if (dto.activated === false) {
      const existing = await this.contractSupportModel.findOne({ id }).lean().exec();
      if (existing?.activated) {
        await this.proratedPlanService.deleteUninvoicedBySourceItem(existing.contractId, id);
      }
    }

    const updated = await this.contractSupportModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    // Silmeden once kalemi bul (contractId icin)
    const item = await this.contractSupportModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }

    // Faturalanmamis kist plani sil
    await this.proratedPlanService.deleteUninvoicedBySourceItem(item.contractId, id);

    // Kalemi sil
    await this.contractSupportModel.deleteOne({ id }).exec();
  }

  /**
   * Kalemi aktive eder (kuruldu/devreye alindi).
   */
  async activate(id: string): Promise<ContractSupportResponseDto> {
    const item = await this.contractSupportModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
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

    if (!item.startDate) {
      updateData.startDate = now;
    }

    const updated = await this.contractSupportModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract support with id ${id} not found`);
    }

    const startDate = (updateData.startDate as Date) || item.startDate;
    if (new Date(startDate).getUTCDate() !== 1) {
      await this.proratedPlanService.createProratedPlan(
        item.contractId,
        {
          price: item.price,
          currency: item.currency,
          startDate: new Date(startDate),
          sourceItemId: item.id,
        },
        SUPPORT_DESCRIPTION,
      );
    }

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(support: ContractSupport): ContractSupportResponseDto {
    return {
      _id: support._id.toString(),
      id: support.id,
      contractId: support.contractId,
      brand: support.brand || "",
      licanceId: support.licanceId || "",
      price: support.price || 0,
      old_price: support.old_price || 0,
      currency: support.currency || "tl",
      type: support.type || "standart",
      yearly: support.yearly || false,
      enabled: support.enabled ?? true,
      blocked: support.blocked || false,
      expired: support.expired || false,
      lastOnlineDay: support.lastOnlineDay || 0,
      calulatedPrice: support.calulatedPrice || 0,
      startDate: support.startDate,
      activated: support.activated || false,
      activatedAt: support.activatedAt,
      editDate: support.editDate,
      editUser: support.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }

  // ─── Stats Metodu ────────────────────────────────────────────

  async getStats(query: SupportsStatsQueryDto): Promise<SupportsStatsDto> {
    const { contractId } = query;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

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
      blockedCount,
      expiredCount,
      yearlyCount,
      monthlyCount,
      typeStats,
      todayStats,
      thisMonthStats,
      thisYearStats,
      yearlyPriceStats,
      monthlyPriceStats,
      monthlyTrendStats
    ] = await Promise.all([
      // Toplam kayıt
      this.contractSupportModel.countDocuments(baseFilter).exec(),

      // Aktif kayıt
      this.contractSupportModel.countDocuments(activeFilter).exec(),

      // Bloklu kayıtlar
      this.contractSupportModel.countDocuments({ ...baseFilter, blocked: true }).exec(),

      // Süresi dolmuş
      this.contractSupportModel.countDocuments({ ...baseFilter, expired: true }).exec(),

      // Yıllık ödeme
      this.contractSupportModel.countDocuments({ ...activeFilter, yearly: true }).exec(),

      // Aylık ödeme
      this.contractSupportModel.countDocuments({ ...activeFilter, yearly: false }).exec(),

      // Tip bazlı dağılım
      this.getTypeStats(activeFilter),

      // Bugün eklenenler
      this.getTimePeriodStats(activeFilter, todayStart),

      // Bu ay eklenenler
      this.getTimePeriodStats(activeFilter, monthStart),

      // Bu yıl eklenenler
      this.getTimePeriodStats(activeFilter, yearStart),

      // Yıllık fiyat toplamları
      this.getCurrencyPriceStats({ ...activeFilter, yearly: true }),

      // Aylık fiyat toplamları
      this.getCurrencyPriceStats({ ...activeFilter, yearly: false }),

      // Aylık trend
      this.getMonthlyTrend(activeFilter, now)
    ]);

    const passive = totalCount - activeCount;

    return {
      total: totalCount,
      active: activeCount,
      passive,
      blocked: blockedCount,
      expired: expiredCount,
      yearly: yearlyCount,
      monthly: monthlyCount,
      typeCounts: typeStats,
      yearlyByPrice: yearlyPriceStats,
      monthlyByPrice: monthlyPriceStats,
      today: todayStats,
      thisMonth: thisMonthStats,
      thisYear: thisYearStats,
      monthlyTrend: monthlyTrendStats
    };
  }

  private async getTimePeriodStats(
    baseFilter: Record<string, unknown>,
    startDate: Date
  ): Promise<TimePeriodStatsDto> {
    const filter = {
      ...baseFilter,
      editDate: { $gte: startDate }
    };

    const result = await this.contractSupportModel.aggregate([
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
    const result = await this.contractSupportModel.aggregate([
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

  private async getTypeStats(
    filter: Record<string, unknown>
  ): Promise<TypeCountsDto> {
    const result = await this.contractSupportModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]).exec();

    const typeCounts: TypeCountsDto = { standart: 0, gold: 0, platin: 0, vip: 0 };

    for (const item of result) {
      const type = this.normalizeType(item._id);
      if (type in typeCounts) {
        typeCounts[type as keyof TypeCountsDto] += item.count;
      }
    }

    return typeCounts;
  }

  private normalizeType(value: string): string {
    const normalized = (value || "standart").toLowerCase();
    if (normalized === "standard") return "standart";
    if (normalized === "platinum") return "platin";
    if (normalized === "standart" || normalized === "gold" || normalized === "platin" || normalized === "vip") {
      return normalized;
    }
    return "standart";
  }

  private async getMonthlyTrend(
    filter: Record<string, unknown>,
    now: Date
  ): Promise<MonthlyTrendDto[]> {
    const months: MonthlyTrendDto[] = [];

    // Son 12 ay için boş array oluştur
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months.push({ month: monthKey, count: 0 });
    }

    // Her ay için kayıt sayısını hesapla
    const results = await Promise.all(
      months.map(async (m) => {
        const [year, month] = m.month.split("-").map(Number);
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 1);

        const count = await this.contractSupportModel.countDocuments({
          ...filter,
          editDate: {
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
