import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  SystemLog,
  SystemLogDocument,
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "./schemas/system-log.schema";
import {
  CreateSystemLogDto,
  SystemLogQueryDto,
  SystemLogResponseDto,
  PaginatedSystemLogsResponseDto,
  SystemLogStatsDto,
} from "./dto";

@Injectable()
export class SystemLogsService {
  constructor(
    @InjectModel(SystemLog.name)
    private systemLogModel: Model<SystemLogDocument>
  ) {}

  /**
   * Yeni sistem logu oluştur
   */
  async create(dto: CreateSystemLogDto): Promise<SystemLogResponseDto> {
    const log = new this.systemLogModel({
      ...dto,
      status: dto.status || SystemLogStatus.SUCCESS,
      details: dto.details || {},
    });
    const saved = await log.save();
    return this.mapToResponse(saved);
  }

  /**
   * Hızlı log oluşturma helper'ı - fire and forget
   */
  async log(
    category: SystemLogCategory,
    action: SystemLogAction,
    module: string,
    options: Partial<CreateSystemLogDto> = {}
  ): Promise<void> {
    try {
      const log = new this.systemLogModel({
        category,
        action,
        module,
        status: SystemLogStatus.SUCCESS,
        details: {},
        ...options,
      });
      await log.save();
    } catch {
      // Loglama hatası ana iş akışını durdurmamalı
      console.error("[SystemLogsService] Log kaydı başarısız:", { category, action, module });
    }
  }

  /**
   * Auth log helper'ı
   */
  async logAuth(
    action: SystemLogAction,
    userId: string | null,
    userName: string | null,
    options: Partial<CreateSystemLogDto> = {}
  ): Promise<void> {
    await this.log(SystemLogCategory.AUTH, action, "auth", {
      userId,
      userName,
      ...options,
    });
  }

  /**
   * CRUD log helper'ı
   */
  async logCrud(
    action: SystemLogAction,
    module: string,
    entityId: string | null,
    entityType: string,
    options: Partial<CreateSystemLogDto> = {}
  ): Promise<void> {
    await this.log(SystemLogCategory.CRUD, action, module, {
      entityId,
      entityType,
      ...options,
    });
  }

  /**
   * Cron log helper'ı
   */
  async logCron(
    action: SystemLogAction,
    module: string,
    options: Partial<CreateSystemLogDto> = {}
  ): Promise<void> {
    await this.log(SystemLogCategory.CRON, action, module, options);
  }

  /**
   * Logları filtreleyerek getir
   */
  async findAll(queryDto: SystemLogQueryDto): Promise<PaginatedSystemLogsResponseDto> {
    const {
      page = 1,
      limit = 50,
      category,
      action,
      module: moduleName,
      userId,
      status,
      search,
      startDate,
      endDate,
      sortField = "createdAt",
      sortOrder = "desc",
    } = queryDto;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;
    if (action) filter.action = action;
    if (moduleName) filter.module = moduleName;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      const createdAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) createdAtFilter.$gte = new Date(startDate);
      if (endDate) createdAtFilter.$lte = new Date(endDate);
      filter.createdAt = createdAtFilter;
    }

    // Metin arama
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { module: { $regex: search, $options: "i" } },
        { entityType: { $regex: search, $options: "i" } },
        { errorMessage: { $regex: search, $options: "i" } },
        { path: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, 1 | -1> = {
      [sortField]: sortOrder === "asc" ? 1 : -1,
    };

    const [data, total, stats] = await Promise.all([
      this.systemLogModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.systemLogModel.countDocuments(filter).exec(),
      this.getStats(filter),
    ]);

    return {
      data: data.map((doc) => this.mapToResponse(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Tek log getir
   */
  async findOne(id: string): Promise<SystemLogResponseDto | null> {
    const log = await this.systemLogModel.findById(id).exec();
    return log ? this.mapToResponse(log) : null;
  }

  /**
   * İstatistikleri hesapla
   */
  private async getStats(
    baseFilter: Record<string, unknown>
  ): Promise<SystemLogStatsDto> {
    const [byCategoryAgg, byStatusAgg, byModuleAgg] = await Promise.all([
      this.systemLogModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
      this.systemLogModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      this.systemLogModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$module", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
    ]);

    const byCategory: Record<string, number> = {};
    byCategoryAgg.forEach((item) => {
      byCategory[item._id] = item.count;
    });

    const byStatus: Record<string, number> = {};
    byStatusAgg.forEach((item) => {
      byStatus[item._id] = item.count;
    });

    const byModule: Record<string, number> = {};
    byModuleAgg.forEach((item) => {
      byModule[item._id] = item.count;
    });

    const total = Object.values(byCategory).reduce((sum, c) => sum + c, 0);

    return { total, byCategory, byStatus, byModule };
  }

  /**
   * Document'ı response DTO'ya dönüştür
   */
  private mapToResponse(doc: SystemLogDocument): SystemLogResponseDto {
    return {
      _id: doc._id.toString(),
      category: doc.category,
      action: doc.action,
      module: doc.module,
      userId: doc.userId,
      userName: doc.userName,
      entityId: doc.entityId,
      entityType: doc.entityType,
      details: doc.details,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      duration: doc.duration,
      status: doc.status,
      errorMessage: doc.errorMessage,
      method: doc.method,
      path: doc.path,
      statusCode: doc.statusCode,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
