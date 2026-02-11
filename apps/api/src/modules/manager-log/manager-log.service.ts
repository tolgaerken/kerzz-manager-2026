import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { ManagerLog, ManagerLogDocument } from "./schemas/manager-log.schema";
import {
  CreateManagerLogDto,
  ManagerLogQueryDto,
  ManagerLogResponseDto,
  PaginatedManagerLogsResponseDto,
  PipelineLogsResponseDto,
  LastByContextsResponseDto,
  LastByContextsDto,
} from "./dto";
import { ManagerNotificationService } from "../manager-notification/manager-notification.service";
import { CreateManagerNotificationDto } from "../manager-notification/dto";
import { LegacyLogRepository } from "./legacy/legacy-log.repository";
import { mapLegacyLogToManagerLogResponse } from "./legacy/legacy-log.mapper";

@Injectable()
export class ManagerLogService {
  constructor(
    @InjectModel(ManagerLog.name)
    private managerLogModel: Model<ManagerLogDocument>,
    @Inject(forwardRef(() => ManagerNotificationService))
    private managerNotificationService: ManagerNotificationService,
    private legacyLogRepository: LegacyLogRepository
  ) {}

  async create(createManagerLogDto: CreateManagerLogDto): Promise<ManagerLogResponseDto> {
    const id = uuidv4();
    const log = new this.managerLogModel({
      ...createManagerLogDto,
      id,
      mentions: createManagerLogDto.mentions || [],
      references: createManagerLogDto.references || [],
      reminder: createManagerLogDto.reminder || null,
    });
    const saved = await log.save();

    // Create notifications for mentions
    if (createManagerLogDto.mentions && createManagerLogDto.mentions.length > 0) {
      await this.createMentionNotifications(saved, createManagerLogDto);
    }

    // Create notification for reminder (will be handled by a scheduler in the future)
    // For now, we just store the reminder in the log

    return this.mapToResponseDto(saved);
  }

  private async createMentionNotifications(
    log: ManagerLogDocument,
    createManagerLogDto: CreateManagerLogDto
  ): Promise<void> {
    const notifications: CreateManagerNotificationDto[] = createManagerLogDto.mentions!.map(
      (mention) => ({
        userId: mention.userId,
        type: "mention" as const,
        logId: log._id.toString(),
        customerId: createManagerLogDto.customerId,
        contextType: createManagerLogDto.contextType,
        contextId: createManagerLogDto.contextId,
        message: this.truncateMessage(createManagerLogDto.message, 100),
      })
    );

    await this.managerNotificationService.createMany(notifications);
  }

  private truncateMessage(message: string, maxLength: number): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + "...";
  }

  async findAll(queryDto: ManagerLogQueryDto): Promise<PaginatedManagerLogsResponseDto> {
    const { customerId, contextType, contextId, includeLegacy = true, page = 1, limit = 50 } = queryDto;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (customerId) filter.customerId = customerId;
    if (contextType) filter.contextType = contextType;
    if (contextId) filter.contextId = contextId;

    // Filter boşsa veya legacy dahil edilmeyecekse, sadece yeni logları getir
    // Legacy sorgusu çok yavaş olabilir (index olmadan tüm koleksiyonu tarar)
    const hasFilter = customerId || contextType || contextId;
    const shouldIncludeLegacy = includeLegacy && hasFilter;

    if (!shouldIncludeLegacy) {
      const [data, total] = await Promise.all([
        this.managerLogModel
          .find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.managerLogModel.countDocuments(filter).exec(),
      ]);

      return {
        data: data.map((doc) => this.mapToResponseDto(doc)),
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    const [newLogs, legacyLogs] = await Promise.all([
      this.managerLogModel.find(filter).sort({ createdAt: -1 }).exec(),
      this.getLegacyLogsSafely(queryDto),
    ]);

    const mergedLogs = [
      ...newLogs.map((doc) => this.mapToResponseDto(doc)),
      ...legacyLogs.map((doc) => mapLegacyLogToManagerLogResponse(doc)),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const paginatedLogs = mergedLogs.slice(skip, skip + limit);
    const total = mergedLogs.length;

    return {
      data: paginatedLogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ManagerLogResponseDto | null> {
    const log = await this.managerLogModel.findById(id).exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async markReminderCompleted(id: string): Promise<ManagerLogResponseDto | null> {
    const log = await this.managerLogModel
      .findByIdAndUpdate(
        id,
        { "reminder.completed": true },
        { new: true }
      )
      .exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  async getPendingReminders(beforeDate: Date): Promise<ManagerLogResponseDto[]> {
    const logs = await this.managerLogModel
      .find({
        "reminder.date": { $lte: beforeDate },
        "reminder.completed": false,
      })
      .exec();
    return logs.map((doc) => this.mapToResponseDto(doc));
  }

  async findByPipeline(pipelineRef: string): Promise<PipelineLogsResponseDto> {
    const logs = await this.managerLogModel
      .find({ pipelineRef })
      .sort({ createdAt: 1 })
      .exec();

    const grouped: PipelineLogsResponseDto = {
      pipelineRef,
      lead: [],
      offer: [],
      sale: [],
    };

    for (const log of logs) {
      const dto = this.mapToResponseDto(log);
      if (log.contextType === "lead") {
        grouped.lead.push(dto);
      } else if (log.contextType === "offer") {
        grouped.offer.push(dto);
      } else if (log.contextType === "sale") {
        grouped.sale.push(dto);
      }
    }

    return grouped;
  }

  private mapToResponseDto(doc: ManagerLogDocument): ManagerLogResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      customerId: doc.customerId,
      contextType: doc.contextType,
      contextId: doc.contextId,
      pipelineRef: doc.pipelineRef,
      message: doc.message,
      mentions: doc.mentions || [],
      references: doc.references || [],
      reminder: doc.reminder,
      authorId: doc.authorId,
      authorName: doc.authorName,
      source: "new",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private async getLegacyLogsSafely(queryDto: ManagerLogQueryDto) {
    try {
      return await this.legacyLogRepository.findAllByQuery(queryDto);
    } catch {
      return [];
    }
  }

  /**
   * Birden fazla context için son log tarihlerini batch olarak getirir.
   * Çoklu context tipi ve legacy log desteği sağlar.
   *
   * @param dto - Sorgu parametreleri
   * @returns Record<entityId, ISO date string> - Her entity için en son log tarihi
   */
  async findLastLogDatesByContexts(
    dto: LastByContextsDto
  ): Promise<LastByContextsResponseDto> {
    const {
      contexts,
      legacyContractIds,
      legacyCustomerIds,
      includeLegacy = true,
      groupByField = "contractId",
    } = dto;

    // Sonuçları birleştirmek için Map kullan (entityId -> Date)
    const resultMap = new Map<string, Date>();

    // 1. Yeni manager-logs koleksiyonundan sorgula
    await this.queryNewLogs(contexts, resultMap);

    // 2. Legacy logları sorgula (opsiyonel)
    if (includeLegacy) {
      await this.queryLegacyLogs(
        legacyContractIds,
        legacyCustomerIds,
        groupByField,
        resultMap
      );
    }

    // 3. Map'i Record<string, string>'e dönüştür
    const response: LastByContextsResponseDto = {};
    for (const [entityId, date] of resultMap) {
      response[entityId] = date.toISOString();
    }

    return response;
  }

  /**
   * Son 5 gün için tarih filtresi oluşturur.
   * Badge için 5+ gün öncesi zaten "5+" olarak gösterildiğinden
   * daha eski logları sorgulamaya gerek yok.
   */
  private getRecentDateFilter(): Date {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);
    return fiveDaysAgo;
  }

  /**
   * Yeni manager-logs koleksiyonundan çoklu context için son log tarihlerini sorgular.
   * Performans için sadece son 5 günü sorgular.
   */
  private async queryNewLogs(
    contexts: Array<{ type: string; ids: string[] }>,
    resultMap: Map<string, Date>
  ): Promise<void> {
    if (!contexts || contexts.length === 0) {
      return;
    }

    const recentDate = this.getRecentDateFilter();

    // Her context tipi için ayrı sorgu yap ve sonuçları birleştir
    for (const context of contexts) {
      if (!context.ids || context.ids.length === 0) {
        continue;
      }

      const results = await this.managerLogModel.aggregate<{
        _id: string;
        lastLogAt: Date;
      }>([
        {
          $match: {
            contextType: context.type,
            contextId: { $in: context.ids },
            createdAt: { $gte: recentDate },
          },
        },
        {
          $group: {
            _id: "$contextId",
            lastLogAt: { $max: "$createdAt" },
          },
        },
      ]);

      // Sonuçları Map'e ekle (daha yeni tarih varsa güncelle)
      for (const item of results) {
        const existing = resultMap.get(item._id);
        if (!existing || item.lastLogAt > existing) {
          resultMap.set(item._id, item.lastLogAt);
        }
      }
    }
  }

  /**
   * Legacy loglardan contractId ve customerId ile son log tarihlerini sorgular.
   * Her iki alanı da sorgular çünkü legacy sistemde log'lar bazen sadece
   * customerId ile, bazen sadece contractId ile tutulmuş olabilir.
   */
  private async queryLegacyLogs(
    legacyContractIds: string[] | undefined,
    legacyCustomerIds: string[] | undefined,
    _groupByField: "contractId" | "customerId",
    resultMap: Map<string, Date>
  ): Promise<void> {
    try {
      // contractId ile sorgula
      if (legacyContractIds && legacyContractIds.length > 0) {
        const contractResults =
          await this.legacyLogRepository.findLastLogDatesByContractIds(
            legacyContractIds
          );

        for (const [contractId, date] of Object.entries(contractResults)) {
          const existing = resultMap.get(contractId);
          if (!existing || date > existing) {
            resultMap.set(contractId, date);
          }
        }
      }

      // customerId ile de sorgula (her zaman, groupByField'dan bağımsız)
      if (legacyCustomerIds && legacyCustomerIds.length > 0) {
        const customerResults =
          await this.legacyLogRepository.findLastLogDatesByCustomerIds(
            legacyCustomerIds
          );

        for (const [customerId, date] of Object.entries(customerResults)) {
          const existing = resultMap.get(customerId);
          if (!existing || date > existing) {
            resultMap.set(customerId, date);
          }
        }
      }
    } catch {
      // Legacy sorgusu başarısız olursa sessizce devam et
    }
  }
}
