import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Sale, SaleDocument } from "./schemas/sale.schema";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleQueryDto } from "./dto/sale-query.dto";
import {
  PaginatedSalesResponseDto,
  SaleResponseDto,
  SaleStatsDto,
} from "./dto/sale-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import {
  PipelineService,
  PipelineCalculatorService,
  PipelineCounterService,
} from "../pipeline";
import { OffersService } from "../offers";

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(Sale.name, CONTRACT_DB_CONNECTION)
    private saleModel: Model<SaleDocument>,
    private pipelineService: PipelineService,
    private calculatorService: PipelineCalculatorService,
    private counterService: PipelineCounterService,
    private offersService: OffersService
  ) {}

  async findAll(query: SaleQueryDto): Promise<PaginatedSalesResponseDto> {
    const {
      page = 1,
      limit,
      search,
      status,
      customerId,
      sellerId,
      sortField = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = query;

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
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Build query - limit varsa pagination uygula, yoksa tüm verileri getir
    let dataQuery = this.saleModel.find(filter).sort(sort);

    if (limit) {
      const skip = (page - 1) * limit;
      dataQuery = dataQuery.skip(skip).limit(limit);
    }

    const [data, total] = await Promise.all([
      dataQuery.lean().exec(),
      this.saleModel.countDocuments(filter).exec(),
    ]);

    const effectiveLimit = limit || total;
    const totalPages = effectiveLimit > 0 ? Math.ceil(total / effectiveLimit) : 1;

    return {
      data: data.map((doc) => this.mapToResponse(doc)),
      meta: {
        total,
        page,
        limit: effectiveLimit,
        totalPages,
        hasNextPage: limit ? page < totalPages : false,
        hasPrevPage: limit ? page > 1 : false,
      },
    };
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.saleModel.findById(id).lean().exec();
    if (!sale) throw new NotFoundException(`Satış bulunamadı: ${id}`);

    const items = await this.pipelineService.getAllItems(id, "sale");

    // Geriye uyumluluk: pipeline koleksiyonları boşsa gömülü array'lere fallback
    return {
      ...this.mapToResponse(sale),
      products: items.products?.length ? items.products : ((sale as any).products || []),
      licenses: items.licenses?.length ? items.licenses : ((sale as any).licenses || []),
      rentals: items.rentals?.length ? items.rentals : ((sale as any).rentals || (sale as any).rentys || []),
      payments: items.payments?.length ? items.payments : ((sale as any).payments || []),
    };
  }

  async create(dto: CreateSaleDto): Promise<SaleResponseDto> {
    const { products, licenses, rentals, payments, ...saleData } = dto;

    if (!saleData.pipelineRef) {
      saleData.pipelineRef = await this.counterService.generateRef();
    }

    const saved = await this.saveWithRetry(saleData);
    const saleId = saved._id.toString();

    if (products || licenses || rentals || payments) {
      await this.pipelineService.syncItems(
        saleId,
        "sale",
        saved.pipelineRef,
        { products, licenses, rentals, payments }
      );
    }

    return this.findOne(saleId);
  }

  async update(id: string, dto: UpdateSaleDto): Promise<SaleResponseDto> {
    const { products, licenses, rentals, payments, ...saleData } = dto;
    const existing = await this.saleModel.findById(id).lean().exec();
    if (!existing) throw new NotFoundException(`Satış bulunamadı: ${id}`);

    const updateOps: Record<string, any> = { $set: saleData };
    const nextStatus = saleData.status;

    if (nextStatus && nextStatus !== existing.status) {
      updateOps.$push = {
        stageHistory: this.buildStageHistoryEntry(
          existing,
          nextStatus,
          saleData.sellerName || saleData.sellerId || ""
        ),
      };
    }

    const sale = await this.saleModel
      .findByIdAndUpdate(id, updateOps, { new: true })
      .lean()
      .exec();

    if (!sale) {
      throw new NotFoundException(`Satış bulunamadı: ${id}`);
    }

    if (
      products !== undefined ||
      licenses !== undefined ||
      rentals !== undefined ||
      payments !== undefined
    ) {
      await this.pipelineService.syncItems(id, "sale", sale.pipelineRef, {
        products,
        licenses,
        rentals,
        payments,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const saleToRemove = await this.saleModel.findById(id).exec();
    if (!saleToRemove) throw new NotFoundException(`Satış bulunamadı: ${id}`);

    await this.pipelineService.deleteAllItems(id, "sale");
    await this.saleModel.findByIdAndDelete(id).exec();
  }

  async calculate(id: string): Promise<any> {
    const sale = await this.saleModel.findById(id).lean().exec();
    if (!sale) throw new NotFoundException(`Satış bulunamadı: ${id}`);

    const totals = await this.calculatorService.calculateTotals(id, "sale");
    await this.saleModel.findByIdAndUpdate(id, { totals }).exec();

    return totals;
  }

  async approve(
    id: string,
    userId: string,
    userName: string
  ): Promise<SaleResponseDto> {
    const sale = await this.saleModel
      .findByIdAndUpdate(
        id,
        {
          approved: true,
          approvedBy: userId,
          approvedByName: userName,
          approvedAt: new Date(),
        },
        { new: true }
      )
      .lean()
      .exec();

    if (!sale) throw new NotFoundException(`Satış bulunamadı: ${id}`);
    return this.mapToResponse(sale);
  }

  async getStats(query?: SaleQueryDto): Promise<SaleStatsDto> {
    const filter: Record<string, any> = {};

    let start = query?.startDate ? new Date(query.startDate) : undefined;
    let end = query?.endDate ? new Date(query.endDate) : undefined;

    if (query?.period) {
      const now = new Date();
      if (!end) end = now;
      if (!start) {
        start = new Date(now);
        switch (query.period) {
          case "daily":
            start.setHours(0, 0, 0, 0);
            break;
          case "weekly": {
            const day = start.getDay() || 7; // Sunday is 0, make it 7
            // Pazartesiye git
            start.setDate(start.getDate() - (day - 1));
            start.setHours(0, 0, 0, 0);
            break;
          }
          case "monthly":
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
          case "quarterly": {
            const q = Math.floor(start.getMonth() / 3);
            start.setMonth(q * 3, 1);
            start.setHours(0, 0, 0, 0);
            break;
          }
          case "yearly":
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        }
      }
    }

    if (start || end) {
      filter.saleDate = {};
      if (start) filter.saleDate.$gte = start;
      if (end) {
        const endDate = new Date(end);
        // Eğer saat verilmemişse gün sonuna ayarla
        if (endDate.getHours() === 0 && endDate.getMinutes() === 0) {
          endDate.setHours(23, 59, 59, 999);
        }
        filter.saleDate.$lte = endDate;
      }
    }

    // Status pipeline
    const pipeline = await this.saleModel
      .aggregate([{ $match: filter }, { $group: { _id: "$status", count: { $sum: 1 } } }])
      .exec();

    const stats: SaleStatsDto = {
      total: 0,
      pending: 0,
      collectionWaiting: 0,
      setupWaiting: 0,
      trainingWaiting: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      totalSalesAmount: 0,
      hardwareSalesAmount: 0,
      licenseSalesAmount: 0,
      saasSalesAmount: 0,
      topSales: [],
    };

    const statusMap: Record<string, keyof Omit<SaleStatsDto, "total" | "topSales">> = {
      pending: "pending",
      "collection-waiting": "collectionWaiting",
      "setup-waiting": "setupWaiting",
      "training-waiting": "trainingWaiting",
      active: "active",
      completed: "completed",
      cancelled: "cancelled",
    };

    for (const item of pipeline) {
      const key = statusMap[item._id];
      if (key && key in stats) {
        // @ts-ignore
        stats[key] = item.count;
      }
      stats.total += item.count;
    }

    const totals = await this.saleModel
      .aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalSalesAmount: { $sum: { $ifNull: ["$grandTotal", 0] } },
            hardwareSalesAmount: { $sum: { $ifNull: ["$hardwareTotal", 0] } },
            saasSalesAmount: { $sum: { $ifNull: ["$saasTotal", 0] } },
            licenseSalesAmount: { $sum: { $ifNull: ["$softwareTotal", 0] } },
          },
        },
      ])
      .exec();

    stats.totalSalesAmount = totals[0]?.totalSalesAmount || 0;
    stats.hardwareSalesAmount = totals[0]?.hardwareSalesAmount || 0;
    stats.saasSalesAmount = totals[0]?.saasSalesAmount || 0;
    stats.licenseSalesAmount = totals[0]?.licenseSalesAmount || 0;

    stats.topSales = await this.saleModel
      .find(filter)
      .sort({ grandTotal: -1 })
      .limit(10)
      .lean()
      .exec()
      .then((docs) => docs.map((doc) => this.mapToResponse(doc)));

    return stats;
  }

  /**
   * Offer -> Sale dönüşümü
   */
  async convertFromOffer(
    offerId: string,
    userId: string,
    userName: string,
    extraData?: Partial<CreateSaleDto>
  ): Promise<SaleResponseDto> {
    const offer = await this.offersService.getForConversion(offerId);

    // Sale oluştur
    const saleData: CreateSaleDto = {
      pipelineRef: (offer as any).pipelineRef,
      offerId: (offer as any)._id.toString(),
      leadId: (offer as any).leadId,
      customerId: (offer as any).customerId,
      customerName: (offer as any).customerName,
      sellerId: (offer as any).sellerId,
      sellerName: (offer as any).sellerName,
      usdRate: (offer as any).usdRate,
      eurRate: (offer as any).eurRate,
      internalFirm: (offer as any).internalFirm,
      notes: (offer as any).offerNote || "",
      ...extraData,
    };

    const saved = await this.saveWithRetry(saleData);
    const saleId = saved._id.toString();

    // Alt koleksiyonları klonla
    await this.pipelineService.cloneAllItems(
      offerId,
      "offer",
      saleId,
      "sale",
      saved.pipelineRef
    );

    // Toplamları hesapla
    const totals = await this.calculatorService.calculateTotals(
      saleId,
      "sale"
    );
    await this.saleModel.findByIdAndUpdate(saleId, { totals }).exec();

    // Offer'ı converted yap
    await this.offersService.markAsConverted(
      offerId,
      saleId,
      userId,
      userName
    );

    return this.findOne(saleId);
  }

  /**
   * Offer->Sale dönüşümünü geri alır
   */
  async revertFromOffer(saleId: string): Promise<void> {
    const sale = await this.saleModel.findById(saleId).lean().exec();
    if (!sale) throw new NotFoundException(`Satış bulunamadı: ${saleId}`);

    if (!sale.offerId) {
      throw new BadRequestException(
        "Bu satış bir tekliften dönüştürülmemiş"
      );
    }

    // Alt koleksiyonları sil
    await this.pipelineService.deleteAllItems(saleId, "sale");

    // Sale'i sil
    await this.saleModel.findByIdAndDelete(saleId).exec();

    // Offer'ın dönüşümünü geri al
    await this.offersService.revertConversion(sale.offerId);
  }

  private mapToResponse(sale: any): SaleResponseDto {
    const statusValue = Array.isArray(sale.status)
      ? sale.status[0] || "pending"
      : sale.status || "pending";

    return {
      _id: sale._id.toString(),
      no: sale.no || 0,
      pipelineRef: sale.pipelineRef || "",
      offerId: sale.offerId || "",
      leadId: sale.leadId || "",
      customerId: sale.customerId || "",
      customerName: sale.customerName || "",
      saleDate: sale.saleDate,
      implementDate: sale.implementDate,
      sellerId: sale.sellerId || "",
      sellerName: sale.sellerName || "",
      totals: sale.totals || {},
      grandTotal: sale.grandTotal || 0,
      hardwareTotal: sale.hardwareTotal || 0,
      saasTotal: sale.saasTotal || 0,
      softwareTotal: sale.softwareTotal || 0,
      total: sale.total || 0,
      usdRate: sale.usdRate || 0,
      eurRate: sale.eurRate || 0,
      status: statusValue,
      approved: sale.approved || false,
      approvedBy: sale.approvedBy || "",
      approvedByName: sale.approvedByName || "",
      approvedAt: sale.approvedAt,
      labels: sale.labels || [],
      notes: sale.notes || "",
      internalFirm: sale.internalFirm || "",
      stageHistory: sale.stageHistory || [],
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }

  private buildStageHistoryEntry(
    sale: any,
    toStatus: string,
    changedBy: string
  ) {
    const now = new Date();
    const lastChangedAt = sale.stageHistory?.length
      ? sale.stageHistory[sale.stageHistory.length - 1]?.changedAt
      : sale.createdAt || sale.updatedAt || now;
    const durationInStage =
      now.getTime() - new Date(lastChangedAt).getTime();
    
    // fromStatus array olabilir, string'e dönüştür
    const fromStatusValue = Array.isArray(sale.status)
      ? sale.status[0] || ""
      : sale.status || "";
    
    return {
      fromStatus: fromStatusValue,
      toStatus,
      changedBy,
      changedAt: now,
      durationInStage: Math.max(durationInStage, 0),
    };
  }

  private async syncSaleCounter(): Promise<void> {
    const maxDoc = await this.saleModel
      .findOne({}, { no: 1 })
      .sort({ no: -1 })
      .lean()
      .exec();

    const maxNo = maxDoc?.no || 0;
    await this.counterService.syncCounter("sale-no", maxNo);
  }

  private async saveWithRetry(
    saleData: CreateSaleDto,
    maxRetries = 3
  ): Promise<SaleDocument> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const no = await this.counterService.generateSaleNo();
        const sale = new this.saleModel({ ...saleData, no });
        return await sale.save();
      } catch (error: any) {
        const isDuplicateNo =
          error?.code === 11000 && error?.keyPattern?.no;

        if (isDuplicateNo && attempt < maxRetries - 1) {
          await this.syncSaleCounter();
          continue;
        }

        throw error;
      }
    }

    throw new BadRequestException(
      "Satış oluşturulamadı. Lütfen tekrar deneyin."
    );
  }
}
