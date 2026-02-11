import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Offer, OfferDocument } from "./schemas/offer.schema";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { OfferQueryDto } from "./dto/offer-query.dto";
import {
  PaginatedOffersResponseDto,
  OfferResponseDto,
} from "./dto/offer-response.dto";
import { OfferStatsDto } from "./dto/offer-stats.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import {
  PipelineService,
  PipelineCalculatorService,
  PipelineCounterService,
} from "../pipeline";
import { LeadsService } from "../leads";
import { CustomersService } from "../customers";

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name, CONTRACT_DB_CONNECTION)
    private offerModel: Model<OfferDocument>,
    private pipelineService: PipelineService,
    private calculatorService: PipelineCalculatorService,
    private counterService: PipelineCounterService,
    private leadsService: LeadsService,
    private customersService: CustomersService
  ) {}

  async findAll(query: OfferQueryDto): Promise<PaginatedOffersResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      customerId,
      sellerId,
      sortField = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, any> = {};

    if (status && status !== "all") filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (sellerId) filter.sellerId = sellerId;

    // Tarih aralığı filtresi (saleDate üzerinden)
    if (startDate || endDate) {
      filter.saleDate = {};
      if (startDate) filter.saleDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.saleDate.$lte = end;
      }
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { pipelineRef: { $regex: search, $options: "i" } },
        { sellerName: { $regex: search, $options: "i" } },
        { offerNote: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.offerModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.offerModel.countDocuments(filter).exec(),
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

  async findOne(id: string): Promise<OfferResponseDto> {
    const offer = await this.offerModel.findById(id).lean().exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    // Alt koleksiyonları populate et
    const items = await this.pipelineService.getAllItems(id, "offer");

    // Geriye uyumluluk: pipeline koleksiyonları boşsa gömülü array'lere fallback
    return {
      ...this.mapToResponse(offer),
      products: items.products?.length ? items.products : ((offer as any).products || []),
      licenses: items.licenses?.length ? items.licenses : ((offer as any).licenses || []),
      rentals: items.rentals?.length ? items.rentals : ((offer as any).rentals || (offer as any).rentys || []),
      payments: items.payments?.length ? items.payments : ((offer as any).payments || []),
    };
  }

  async getStats(): Promise<OfferStatsDto> {
    const openStatuses = ["draft", "sent", "revised", "waiting", "approved"];
    const weightedStatuses = ["draft", "sent", "revised", "waiting", "approved"];

    const [pipeline, openValueResult, weightedValueResult] = await Promise.all([
      this.offerModel
        .aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.offerModel
        .aggregate([
          { $match: { status: { $in: openStatuses } } },
          {
            $group: {
              _id: null,
              openValue: {
                $sum: { $ifNull: ["$totals.overallGrandTotal", 0] },
              },
            },
          },
        ])
        .exec(),
      this.offerModel
        .aggregate([
          { $match: { status: { $in: weightedStatuses } } },
          {
            $addFields: {
              weight: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$status", "draft"] }, then: 0.3 },
                    { case: { $eq: ["$status", "sent"] }, then: 0.5 },
                    { case: { $eq: ["$status", "revised"] }, then: 0.5 },
                    { case: { $eq: ["$status", "waiting"] }, then: 0.6 },
                    { case: { $eq: ["$status", "approved"] }, then: 0.8 },
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
                  $multiply: [
                    { $ifNull: ["$totals.overallGrandTotal", 0] },
                    "$weight",
                  ],
                },
              },
            },
          },
        ])
        .exec(),
    ]);

    const stats: OfferStatsDto = {
      total: 0,
      draft: 0,
      sent: 0,
      revised: 0,
      waiting: 0,
      approved: 0,
      rejected: 0,
      won: 0,
      lost: 0,
      converted: 0,
      openValue: 0,
      weightedValue: 0,
    };

    for (const item of pipeline) {
      const key = item._id as keyof Omit<OfferStatsDto, "total">;
      if (key in stats) {
        (stats as any)[key] = item.count;
      }
      stats.total += item.count;
    }

    stats.openValue = openValueResult[0]?.openValue || 0;
    stats.weightedValue = weightedValueResult[0]?.weightedValue || 0;

    return stats;
  }

  async create(dto: CreateOfferDto): Promise<OfferResponseDto> {
    const { products, licenses, rentals, payments, ...offerData } = dto;

    // pipelineRef yoksa yeni üret
    if (!offerData.pipelineRef) {
      offerData.pipelineRef = await this.counterService.generateRef();
    }

    const saved = await this.saveWithRetry(offerData);
    const offerId = saved._id.toString();

    // Dual write: alt koleksiyonları kaydet
    if (products || licenses || rentals || payments) {
      await this.pipelineService.syncItems(
        offerId,
        "offer",
        saved.pipelineRef,
        { products, licenses, rentals, payments }
      );
    }

    return this.findOne(offerId);
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferResponseDto> {
    const { products, licenses, rentals, payments, ...offerData } = dto;
    const existing = await this.offerModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    const updateOps: Record<string, any> = { $set: offerData };
    const nextStatus = offerData.status;

    if (nextStatus && nextStatus !== existing.status) {
      updateOps.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          nextStatus,
          offerData.sellerName || offerData.sellerId || ""
        ),
      };
    }

    const offer = await this.offerModel
      .findByIdAndUpdate(id, updateOps, { new: true })
      .lean()
      .exec();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Dual write
    if (
      products !== undefined ||
      licenses !== undefined ||
      rentals !== undefined ||
      payments !== undefined
    ) {
      await this.pipelineService.syncItems(id, "offer", offer.pipelineRef, {
        products,
        licenses,
        rentals,
        payments,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const offer = await this.offerModel.findById(id).exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    // Cascade: alt koleksiyonları sil
    await this.pipelineService.deleteAllItems(id, "offer");
    await this.offerModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(
    id: string,
    status: string
  ): Promise<OfferResponseDto> {
    const existing = await this.offerModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    const updateOps: Record<string, any> = { $set: { status } };
    if (status !== existing.status) {
      updateOps.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          status,
          existing.sellerName || existing.sellerId || ""
        ),
      };
    }

    const offer = await this.offerModel
      .findByIdAndUpdate(id, updateOps, { new: true })
      .lean()
      .exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);
    return this.mapToResponse(offer);
  }

  async calculate(id: string): Promise<any> {
    const offer = await this.offerModel.findById(id).lean().exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    const totals = await this.calculatorService.calculateTotals(id, "offer");

    await this.offerModel.findByIdAndUpdate(id, { totals }).exec();

    return totals;
  }

  /**
   * Lead -> Offer dönüşümü
   */
  async convertFromLead(
    leadId: string,
    extraData?: Partial<CreateOfferDto>
  ): Promise<OfferResponseDto> {
    const lead = await this.leadsService.getForConversion(leadId);

    // Müşteri kaydı kontrol et
    let customerId = lead.customerId;
    let customerName = lead.companyName || lead.contactName;

    if (!customerId) {
      // Prospect müşteri oluştur
      const prospect = await this.customersService.create({
        type: "prospect",
        name: lead.contactName,
        companyName: lead.companyName,
        phone: lead.contactPhone,
        email: lead.contactEmail,
      } as any);
      customerId = prospect._id;
      customerName = prospect.companyName || prospect.name;
    }

    // Offer oluştur
    const offerData: CreateOfferDto = {
      pipelineRef: (lead as any).pipelineRef,
      leadId: (lead as any)._id.toString(),
      customerId,
      customerName,
      offerNote: lead.notes || "",
      ...extraData,
    };

    const offer = await this.create(offerData);

    // Lead'i converted yap
    await this.leadsService.markAsConverted(leadId, customerId);

    return offer;
  }

  /**
   * Lead -> Offer dönüşümünü geri alır
   */
  async revertFromLead(leadId: string): Promise<void> {
    const offer = await this.offerModel
      .findOne({ leadId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    if (!offer) {
      throw new NotFoundException(`Lead için teklif bulunamadı: ${leadId}`);
    }

    if (offer.status === "converted") {
      throw new BadRequestException(
        "Satışa dönüştürülmüş teklif geri alınamaz"
      );
    }

    const offerId = offer._id.toString();

    await this.pipelineService.deleteAllItems(offerId, "offer");
    await this.offerModel.findByIdAndDelete(offerId).exec();
    await this.leadsService.revertConversion(leadId);
  }

  /**
   * Offer -> Sale dönüşümü için offer'ı getirir ve validasyon yapar
   */
  async getForConversion(id: string): Promise<Offer> {
    const offer = await this.offerModel.findById(id).lean().exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    if (offer.conversionInfo?.converted) {
      throw new BadRequestException("Bu teklif zaten satışa dönüştürülmüş");
    }

    return offer;
  }

  /**
   * Offer'ı converted durumuna günceller
   */
  async markAsConverted(
    id: string,
    saleId: string,
    userId: string,
    userName: string
  ): Promise<void> {
    const existing = await this.offerModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    const update: any = {
      status: "converted",
      conversionInfo: {
        saleId,
        converted: true,
        convertedBy: userId,
        convertedByName: userName,
        convertedAt: new Date(),
      },
    };

    if (existing.status !== "converted") {
      update.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          "converted",
          userName || userId
        ),
      };
    }

    await this.offerModel.findByIdAndUpdate(id, update).exec();
  }

  /**
   * Offer dönüşümünü geri alır
   */
  async revertConversion(id: string): Promise<OfferResponseDto> {
    const offer = await this.offerModel.findById(id).lean().exec();
    if (!offer) throw new NotFoundException(`Teklif bulunamadı: ${id}`);

    if (!offer.conversionInfo?.converted) {
      throw new BadRequestException("Bu teklif dönüştürülmemiş");
    }

    const update: any = {
      status: "approved",
      conversionInfo: {
        saleId: "",
        converted: false,
        convertedBy: "",
        convertedByName: "",
        convertedAt: undefined,
      },
    };

    if (offer.status !== "approved") {
      update.$push = {
        stageHistory: this.buildStageHistoryEntry(
          offer,
          "approved",
          offer.sellerName || offer.sellerId || ""
        ),
      };
    }

    await this.offerModel.findByIdAndUpdate(id, update).exec();

    return this.findOne(id);
  }

  private async syncOfferCounter(): Promise<void> {
    const maxDoc = await this.offerModel
      .findOne({}, { no: 1 })
      .sort({ no: -1 })
      .lean()
      .exec();

    const maxNo = maxDoc?.no || 0;
    await this.counterService.syncCounter("offer-no", maxNo);
  }

  private async saveWithRetry(
    offerData: CreateOfferDto,
    maxRetries = 3
  ): Promise<OfferDocument> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const no = await this.counterService.generateOfferNo();
        const offer = new this.offerModel({ ...offerData, no });
        return await offer.save();
      } catch (error: any) {
        const isDuplicateNo =
          error?.code === 11000 && error?.keyPattern?.no;

        if (isDuplicateNo && attempt < maxRetries - 1) {
          await this.syncOfferCounter();
          continue;
        }

        throw error;
      }
    }

    throw new BadRequestException(
      "Teklif oluşturulamadı. Lütfen tekrar deneyin."
    );
  }

  private buildStageHistoryEntry(
    offer: any,
    toStatus: string,
    changedBy: string
  ) {
    const now = new Date();
    const lastChangedAt = offer.stageHistory?.length
      ? offer.stageHistory[offer.stageHistory.length - 1]?.changedAt
      : offer.createdAt || offer.updatedAt || now;
    const durationInStage =
      now.getTime() - new Date(lastChangedAt).getTime();
    
    // fromStatus array olabilir, string'e dönüştür
    const fromStatusValue = Array.isArray(offer.status)
      ? offer.status[0] || ""
      : offer.status || "";
    
    return {
      fromStatus: fromStatusValue,
      toStatus,
      changedBy,
      changedAt: now,
      durationInStage: Math.max(durationInStage, 0),
    };
  }

  private mapToResponse(offer: any): OfferResponseDto {
    const conv = offer.conversionInfo || {};
    return {
      _id: offer._id.toString(),
      no: offer.no || 0,
      pipelineRef: offer.pipelineRef || "",
      leadId: offer.leadId || "",
      customerId: offer.customerId || "",
      customerName: offer.customerName || "",
      saleDate: offer.saleDate || offer.offerDate, // Backward compatibility
      validUntil: offer.validUntil,
      sellerId: offer.sellerId || "",
      sellerName: offer.sellerName || "",
      totals: offer.totals || {},
      usdRate: offer.usdRate || 0,
      eurRate: offer.eurRate || 0,
      status: offer.status || "draft",
      conversionInfo: {
        saleId: conv.saleId || "",
        converted: conv.converted || false,
        convertedBy: conv.convertedBy || "",
        convertedByName: conv.convertedByName || "",
        convertedAt: conv.convertedAt,
      },
      lossInfo: offer.lossInfo || {},
      stageHistory: offer.stageHistory || [],
      offerNote: offer.offerNote || "",
      mailList: offer.mailList || [],
      labels: offer.labels || [],
      internalFirm: offer.internalFirm || "",
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
