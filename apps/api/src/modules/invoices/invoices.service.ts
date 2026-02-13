import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Invoice, InvoiceDocument } from "./schemas/invoice.schema";
import { InvoiceQueryDto } from "./dto/invoice-query.dto";
import {
  PaginatedInvoicesResponseDto,
  InvoiceResponseDto,
  InvoiceCountsDto
} from "./dto/invoice-response.dto";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name, CONTRACT_DB_CONNECTION)
    private invoiceModel: Model<InvoiceDocument>
  ) {}

  async findAll(query: InvoiceQueryDto): Promise<PaginatedInvoicesResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      invoiceType,
      isPaid,
      customerId,
      erpId,
      contractId,
      internalFirm,
      startDate,
      endDate,
      sortField = "invoiceDate",
      sortOrder = "desc"
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: Record<string, unknown> = {
      invoiceNo: { $ne: "" }
    };

    // Invoice type filter
    if (invoiceType) {
      filter.invoiceType = invoiceType;
    }

    // isPaid filter
    if (isPaid !== undefined) {
      filter.isPaid = isPaid;
    }

    // Customer filter
    if (customerId) {
      filter.customerId = customerId;
    }

    // ERP ID filter (CariKodu)
    if (erpId) {
      filter.erpId = erpId;
    }

    // Contract filter
    if (contractId) {
      filter.contractId = contractId;
    }

    // Internal firm filter
    if (internalFirm) {
      filter.internalFirm = internalFirm;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.invoiceDate = {};
      if (startDate) {
        (filter.invoiceDate as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.invoiceDate as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    // Search filter
    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { erpId: { $regex: search, $options: "i" } }
        ]
      };

      filter = { ...filter, ...searchFilter };
    }

    // Build sort object
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.invoiceModel.countDocuments(filter).exec(),
      this.getCounts(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      counts
    };
  }

  async findOne(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceModel.findById(id).lean().exec();

    if (!invoice) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(invoice);
  }

  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
    const invoiceData = {
      ...createInvoiceDto,
      id: uuidv4()
    };

    const created = new this.invoiceModel(invoiceData);
    const saved = await created.save();

    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const updated = await this.invoiceModel
      .findByIdAndUpdate(id, { $set: updateInvoiceDto }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }
  }

  /**
   * Müşteri bazında ödenmemiş fatura sayısı ve tutarını döner
   * erpId (CariKodu) bazında gruplar
   */
  async getUnpaidSummaryByErp(): Promise<{ erpId: string; count: number; totalAmount: number }[]> {
    return this.invoiceModel.aggregate([
      { $match: { isPaid: false, erpId: { $ne: null, $ne: "" } } },
      {
        $group: {
          _id: "$erpId",
          count: { $sum: 1 },
          totalAmount: { $sum: "$grandTotal" }
        }
      },
      { $project: { erpId: "$_id", count: 1, totalAmount: 1, _id: 0 } }
    ]).exec();
  }

  private async getCounts(baseFilter: Record<string, unknown>): Promise<InvoiceCountsDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      total,
      paid,
      unpaid,
      overdue,
      totalAmountResult,
      paidAmountResult,
      unpaidAmountResult,
      contractCount,
      saleCount,
      eDocumentsCount
    ] = await Promise.all([
      this.invoiceModel.countDocuments(baseFilter).exec(),
      this.invoiceModel.countDocuments({ ...baseFilter, isPaid: true }).exec(),
      this.invoiceModel.countDocuments({ ...baseFilter, isPaid: false }).exec(),
      this.invoiceModel.countDocuments({
        ...baseFilter,
        isPaid: false,
        dueDate: { $lt: today }
      }).exec(),
      this.invoiceModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]).exec(),
      this.invoiceModel.aggregate([
        { $match: { ...baseFilter, isPaid: true } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]).exec(),
      this.invoiceModel.aggregate([
        { $match: { ...baseFilter, isPaid: false } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } }
      ]).exec(),
      this.invoiceModel.countDocuments({ ...baseFilter, invoiceType: "contract" }).exec(),
      this.invoiceModel.countDocuments({ ...baseFilter, invoiceType: "sale" }).exec(),
      this.invoiceModel.countDocuments({ ...baseFilter, invoiceType: "eDocuments" }).exec()
    ]);

    return {
      total,
      paid,
      unpaid,
      overdue,
      totalAmount: totalAmountResult[0]?.total || 0,
      paidAmount: paidAmountResult[0]?.total || 0,
      unpaidAmount: unpaidAmountResult[0]?.total || 0,
      byType: {
        contract: contractCount,
        sale: saleCount,
        eDocuments: eDocumentsCount
      }
    };
  }

  private mapToResponseDto(doc: any): InvoiceResponseDto {
    return {
      _id: doc._id?.toString(),
      id: doc.id,
      contractId: doc.contractId || "",
      customerId: doc.customerId || "",
      name: doc.name || "",
      description: doc.description || "",
      dueDate: doc.dueDate,
      eCreditId: doc.eCreditId || "",
      erpId: doc.erpId || "",
      grandTotal: doc.grandTotal || 0,
      invoiceDate: doc.invoiceDate,
      invoiceNumber: doc.invoiceNumber || "",
      invoiceRows: doc.invoiceRows || [],
      invoiceType: doc.invoiceType || "contract",
      invoiceUUID: doc.invoiceUUID || "",
      lateFeeLastCalculationDate: doc.lateFeeLastCalculationDate,
      lateFeeStatus: doc.lateFeeStatus || "",
      lateFeeTotal: doc.lateFeeTotal || 0,
      payDate: doc.payDate,
      saleId: doc.saleId || "",
      taxTotal: doc.taxTotal || 0,
      total: doc.total || 0,
      internalFirm: doc.internalFirm || "",
      reference: doc.reference || "",
      notify: doc.notify || [],
      lastNotify: doc.lastNotify,
      isPaid: doc.isPaid || false,
      paymentSuccessDate: doc.paymentSuccessDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }
}
