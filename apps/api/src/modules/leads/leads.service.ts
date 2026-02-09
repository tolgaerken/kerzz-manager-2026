import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Lead, LeadDocument } from "./schemas/lead.schema";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { LeadQueryDto } from "./dto/lead-query.dto";
import { AddActivityDto } from "./dto/add-activity.dto";
import {
  PaginatedLeadsResponseDto,
  LeadResponseDto,
  LeadStatsDto,
} from "./dto/lead-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PipelineCounterService } from "../pipeline";

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name, CONTRACT_DB_CONNECTION)
    private leadModel: Model<LeadDocument>,
    private counterService: PipelineCounterService
  ) {}

  async findAll(query: LeadQueryDto): Promise<PaginatedLeadsResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      priority,
      assignedUserId,
      sortField = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (assignedUserId) {
      filter.assignedUserId = assignedUserId;
    }

    // Tarih aralığı filtresi (createdAt üzerinden)
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { contactName: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { contactEmail: { $regex: search, $options: "i" } },
        { contactPhone: { $regex: search, $options: "i" } },
        { pipelineRef: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.leadModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponse(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<LeadResponseDto> {
    const lead = await this.leadModel.findById(id).lean().exec();
    if (!lead) throw new NotFoundException(`Lead bulunamadı: ${id}`);
    return this.mapToResponse(lead);
  }

  async create(dto: CreateLeadDto): Promise<LeadResponseDto> {
    const pipelineRef = await this.counterService.generateRef();
    const lead = new this.leadModel({ ...dto, pipelineRef });
    const saved = await lead.save();
    return this.mapToResponse(saved.toObject());
  }

  async update(id: string, dto: UpdateLeadDto): Promise<LeadResponseDto> {
    const existing = await this.leadModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Lead bulunamadı: ${id}`);

    const updateOps: Record<string, any> = { $set: dto };
    const nextStatus = dto.status;

    if (nextStatus && nextStatus !== existing.status) {
      const historyEntry = this.buildStageHistoryEntry(
        existing,
        nextStatus,
        dto.assignedUserName || dto.assignedUserId || ""
      );
      updateOps.$push = { stageHistory: historyEntry };
    }

    const lead = await this.leadModel
      .findByIdAndUpdate(id, updateOps, { new: true })
      .lean()
      .exec();

    if (!lead) throw new NotFoundException(`Lead bulunamadı: ${id}`);
    return this.mapToResponse(lead);
  }

  async remove(id: string): Promise<void> {
    const result = await this.leadModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException(`Lead bulunamadı: ${id}`);
  }

  async addActivity(
    id: string,
    dto: AddActivityDto
  ): Promise<LeadResponseDto> {
    const activity = {
      ...dto,
      date: new Date(),
    };

    const lead = await this.leadModel
      .findByIdAndUpdate(
        id,
        { $push: { activities: activity } },
        { new: true }
      )
      .lean()
      .exec();

    if (!lead) throw new NotFoundException(`Lead bulunamadı: ${id}`);
    return this.mapToResponse(lead);
  }

  async getStats(): Promise<LeadStatsDto> {
    const openStatuses = ["new", "contacted", "qualified"];
    const weightedStatuses = ["new", "contacted", "qualified"];

    const [pipeline, openValueResult, weightedValueResult] = await Promise.all([
      this.leadModel
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.leadModel
        .aggregate([
          { $match: { status: { $in: openStatuses } } },
          {
            $group: {
              _id: null,
              openValue: { $sum: { $ifNull: ["$estimatedValue", 0] } },
            },
          },
        ])
        .exec(),
      this.leadModel
        .aggregate([
          { $match: { status: { $in: weightedStatuses } } },
          {
            $addFields: {
              weight: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$status", "new"] }, then: 0.1 },
                    { case: { $eq: ["$status", "contacted"] }, then: 0.2 },
                    { case: { $eq: ["$status", "qualified"] }, then: 0.4 },
                  ],
                  default: 0,
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              weightedValue: {
                $sum: {
                  $multiply: [{ $ifNull: ["$estimatedValue", 0] }, "$weight"],
                },
              },
            },
          },
        ])
        .exec(),
    ]);

    const stats: LeadStatsDto = {
      total: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      unqualified: 0,
      converted: 0,
      lost: 0,
      openValue: 0,
      weightedValue: 0,
    };

    for (const item of pipeline) {
      const key = item._id as keyof Omit<LeadStatsDto, "total">;
      if (key in stats) {
        (stats as any)[key] = item.count;
      }
      stats.total += item.count;
    }

    stats.openValue = openValueResult[0]?.openValue || 0;
    stats.weightedValue = weightedValueResult[0]?.weightedValue || 0;

    return stats;
  }

  /**
   * Lead -> Offer dönüşümü için lead'i getirir ve validasyon yapar
   */
  async getForConversion(id: string): Promise<Lead> {
    const lead = await this.leadModel.findById(id).lean().exec();
    if (!lead) throw new NotFoundException(`Lead bulunamadı: ${id}`);

    if (lead.status === "converted") {
      throw new BadRequestException("Bu lead zaten teklife dönüştürülmüş");
    }

    if (lead.status === "lost") {
      throw new BadRequestException(
        "Kaybedilmiş bir lead teklife dönüştürülemez"
      );
    }

    return lead;
  }

  /**
   * Lead'i converted durumuna günceller
   */
  async markAsConverted(
    id: string,
    customerId?: string
  ): Promise<void> {
    const existing = await this.leadModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Lead bulunamadı: ${id}`);

    const update: any = { status: "converted" };
    if (customerId) {
      update.customerId = customerId;
    }
    if (existing.status !== "converted") {
      update.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          "converted",
          existing.assignedUserName || existing.assignedUserId || ""
        ),
      };
    }
    await this.leadModel.findByIdAndUpdate(id, update).exec();
  }

  /**
   * Converted lead'i geri alır
   */
  async revertConversion(id: string): Promise<void> {
    const existing = await this.leadModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Lead bulunamadı: ${id}`);

    const update: any = { status: "qualified" };
    if (existing.status !== "qualified") {
      update.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          "qualified",
          existing.assignedUserName || existing.assignedUserId || ""
        ),
      };
    }
    await this.leadModel
      .findByIdAndUpdate(id, update)
      .exec();
  }

  private buildStageHistoryEntry(
    lead: any,
    toStatus: string,
    changedBy: string
  ) {
    const now = new Date();
    const lastChangedAt = lead.stageHistory?.length
      ? lead.stageHistory[lead.stageHistory.length - 1]?.changedAt
      : lead.createdAt || lead.updatedAt || now;
    const durationInStage =
      now.getTime() - new Date(lastChangedAt).getTime();
    return {
      fromStatus: lead.status || "",
      toStatus,
      changedBy,
      changedAt: now,
      durationInStage: Math.max(durationInStage, 0),
    };
  }

  private mapToResponse(lead: any): LeadResponseDto {
    return {
      _id: lead._id.toString(),
      pipelineRef: lead.pipelineRef || "",
      customerId: lead.customerId || "",
      contactName: lead.contactName || "",
      contactPhone: lead.contactPhone || "",
      contactEmail: lead.contactEmail || "",
      companyName: lead.companyName || "",
      source: lead.source || "",
      assignedUserId: lead.assignedUserId || "",
      assignedUserName: lead.assignedUserName || "",
      status: lead.status || "new",
      priority: lead.priority || "medium",
      notes: lead.notes || "",
      estimatedValue: lead.estimatedValue || 0,
      currency: lead.currency || "tl",
      expectedCloseDate: lead.expectedCloseDate,
      labels: lead.labels || [],
      activities: lead.activities || [],
      lossInfo: lead.lossInfo || {},
      stageHistory: lead.stageHistory || [],
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }
}
