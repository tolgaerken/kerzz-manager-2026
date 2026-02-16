import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractSaas, ContractSaasDocument } from "./schemas/contract-saas.schema";
import {
  ContractSaasQueryDto,
  CreateContractSaasDto,
  UpdateContractSaasDto,
  ContractSaasResponseDto,
  ContractSaasListResponseDto,
  SaasStatsQueryDto,
  SaasStatsDto,
  CurrencyBreakdownDto,
  TimePeriodStatsDto,
  ProductDistributionDto,
  MonthlyTrendDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ProratedPlanService } from "../contract-payments/services/prorated-plan.service";

@Injectable()
export class ContractSaasService {
  constructor(
    @InjectModel(ContractSaas.name, CONTRACT_DB_CONNECTION)
    private contractSaasModel: Model<ContractSaasDocument>,
    private readonly proratedPlanService: ProratedPlanService,
  ) {}

  async findAll(query: ContractSaasQueryDto): Promise<ContractSaasListResponseDto> {
    const { contractId, enabled } = query;

    const filter: Record<string, unknown> = {};
    if (contractId) {
      filter.contractId = contractId;
    }
    if (enabled !== undefined) {
      filter.enabled = enabled;
    }

    const [data, total] = await Promise.all([
      this.contractSaasModel.find(filter).lean().exec(),
      this.contractSaasModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractSaasResponseDto> {
    const saas = await this.contractSaasModel.findOne({ id }).lean().exec();
    if (!saas) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }
    return this.mapToResponseDto(saas);
  }

  async create(dto: CreateContractSaasDto): Promise<ContractSaasResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const saas = new this.contractSaasModel({
      ...dto,
      id,
      enabled: true,
      expired: false,
      startDate: dto.startDate ? new Date(dto.startDate) : now,
      activated: false,
      editDate: now,
      editUser: "system"
    });

    const saved = await saas.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractSaasDto): Promise<ContractSaasResponseDto> {
    // activated true geldiyse aktivasyon mantığını çalıştır
    if (dto.activated === true) {
      const existing = await this.contractSaasModel.findOne({ id }).lean().exec();
      if (!existing) {
        throw new NotFoundException(`Contract saas with id ${id} not found`);
      }
      if (!existing.activated) {
        return this.activate(id);
      }
    }

    const updated = await this.contractSaasModel
      .findOneAndUpdate(
        { id },
        { ...dto, editDate: new Date() },
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    // Silmeden once kalemi bul (contractId icin)
    const item = await this.contractSaasModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }

    // Faturalanmamis kist plani sil
    await this.proratedPlanService.deleteUninvoicedBySourceItem(item.contractId, id);

    // Kalemi sil
    await this.contractSaasModel.deleteOne({ id }).exec();
  }

  /**
   * Kalemi aktive eder (kuruldu/devreye alindi).
   */
  async activate(id: string): Promise<ContractSaasResponseDto> {
    const item = await this.contractSaasModel.findOne({ id }).lean().exec();
    if (!item) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
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

    const updated = await this.contractSaasModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract saas with id ${id} not found`);
    }

    const startDate = (updateData.startDate as Date) || item.startDate;
    if (new Date(startDate).getUTCDate() !== 1) {
      await this.proratedPlanService.createProratedPlan(
        item.contractId,
        {
          price: item.price,
          currency: item.currency,
          startDate: new Date(startDate),
          qty: item.qty,
          sourceItemId: item.id,
        },
        item.description || "SaaS Hizmeti",
      );
    }

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(saas: ContractSaas): ContractSaasResponseDto {
    return {
      _id: saas._id.toString(),
      id: saas.id,
      contractId: saas.contractId,
      brand: saas.brand || "",
      licanceId: saas.licanceId || "",
      description: saas.description || "",
      price: saas.price || 0,
      old_price: saas.old_price || 0,
      qty: saas.qty || 1,
      currency: saas.currency || "tl",
      yearly: saas.yearly || false,
      enabled: saas.enabled ?? true,
      expired: saas.expired || false,
      blocked: saas.blocked || false,
      productId: saas.productId || "",
      total: saas.total || 0,
      startDate: saas.startDate,
      activated: saas.activated || false,
      activatedAt: saas.activatedAt,
      editDate: saas.editDate,
      editUser: saas.editUser || ""
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }

  // ─── Stats Metodu ────────────────────────────────────────────

  async getStats(query: SaasStatsQueryDto): Promise<SaasStatsDto> {
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
      totalQty,
      todayStats,
      thisMonthStats,
      thisYearStats,
      yearlyTotalStats,
      monthlyTotalStats,
      productStats,
      monthlyTrendStats
    ] = await Promise.all([
      // Toplam kayıt
      this.contractSaasModel.countDocuments(baseFilter).exec(),

      // Aktif kayıt
      this.contractSaasModel.countDocuments(activeFilter).exec(),

      // Bloklu kayıtlar
      this.contractSaasModel.countDocuments({ ...baseFilter, blocked: true }).exec(),

      // Süresi dolmuş
      this.contractSaasModel.countDocuments({ ...baseFilter, expired: true }).exec(),

      // Yıllık ödeme
      this.contractSaasModel.countDocuments({ ...activeFilter, yearly: true }).exec(),

      // Aylık ödeme
      this.contractSaasModel.countDocuments({ ...activeFilter, yearly: false }).exec(),

      // Toplam qty
      this.getTotalQty(activeFilter),

      // Bugün eklenenler
      this.getTimePeriodStats(activeFilter, todayStart),

      // Bu ay eklenenler
      this.getTimePeriodStats(activeFilter, monthStart),

      // Bu yıl eklenenler
      this.getTimePeriodStats(activeFilter, yearStart),

      // Yıllık total toplamları
      this.getCurrencyTotalStats({ ...activeFilter, yearly: true }),

      // Aylık total toplamları
      this.getCurrencyTotalStats({ ...activeFilter, yearly: false }),

      // Ürün dağılımı
      this.getProductDistribution(activeFilter),

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
      totalQty,
      yearlyByTotal: yearlyTotalStats,
      monthlyByTotal: monthlyTotalStats,
      productDistribution: productStats,
      today: todayStats,
      thisMonth: thisMonthStats,
      thisYear: thisYearStats,
      monthlyTrend: monthlyTrendStats
    };
  }

  private async getTotalQty(filter: Record<string, unknown>): Promise<number> {
    const result = await this.contractSaasModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: "$qty" }
        }
      }
    ]).exec();

    return result.length > 0 ? result[0].total : 0;
  }

  private async getTimePeriodStats(
    baseFilter: Record<string, unknown>,
    startDate: Date
  ): Promise<TimePeriodStatsDto> {
    const filter = {
      ...baseFilter,
      editDate: { $gte: startDate }
    };

    const result = await this.contractSaasModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$currency",
          count: { $sum: 1 },
          totalAmount: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$total", null] }, { $gt: ["$total", 0] }] },
                "$total",
                { $multiply: ["$price", { $ifNull: ["$qty", 1] }] }
              ]
            }
          }
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
        currencyTotals[currency] = item.totalAmount;
        totalCount += item.count;
      }
    }

    return {
      count: totalCount,
      currencyCounts,
      currencyTotals
    };
  }

  private async getCurrencyTotalStats(
    filter: Record<string, unknown>
  ): Promise<CurrencyBreakdownDto> {
    const result = await this.contractSaasModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$currency",
          total: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ["$total", null] }, { $gt: ["$total", 0] }] },
                "$total",
                { $multiply: ["$price", { $ifNull: ["$qty", 1] }] }
              ]
            }
          }
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

  private async getProductDistribution(
    filter: Record<string, unknown>
  ): Promise<ProductDistributionDto[]> {
    const result = await this.contractSaasModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$productId",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).exec();

    return result.map(item => ({
      productId: item._id || "unknown",
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

        const count = await this.contractSaasModel.countDocuments({
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
