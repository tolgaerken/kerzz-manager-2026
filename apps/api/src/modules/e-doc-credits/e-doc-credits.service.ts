import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { EDocCredit, EDocCreditDocument } from "./schemas/e-doc-credit.schema";
import {
  Customer,
  CustomerDocument,
} from "../customers/schemas/customer.schema";
import {
  EDocCreditQueryDto,
  CreateEDocCreditDto,
  UpdateEDocCreditDto,
  EDocCreditResponseDto,
  EDocCreditsListResponseDto,
} from "./dto";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class EDocCreditsService {
  constructor(
    @InjectModel(EDocCredit.name, HELPERS_DB_CONNECTION)
    private eDocCreditModel: Model<EDocCreditDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>
  ) {}

  async findAll(query: EDocCreditQueryDto): Promise<EDocCreditsListResponseDto> {
    const filter: Record<string, unknown> = {};

    if (query.erpId) {
      filter.erpId = query.erpId;
    }

    if (query.currency) {
      filter.currency = query.currency;
    }

    if (query.internalFirm) {
      filter.internalFirm = query.internalFirm;
    }

    if (query.search) {
      filter.$or = [
        { erpId: { $regex: query.search, $options: "i" } },
        { customerId: { $regex: query.search, $options: "i" } },
        { invoiceNumber: { $regex: query.search, $options: "i" } },
        { internalFirm: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortField = query.sortField || "date";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.eDocCreditModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .lean()
        .exec(),
      this.eDocCreditModel.countDocuments(filter).exec(),
    ]);

    // Müşteri isimlerini erpId üzerinden toplu olarak çek
    const erpIds = [
      ...new Set(
        (data as any[]).map((d) => d.erpId).filter(Boolean)
      ),
    ];

    let customerNameMap = new Map<string, string>();

    if (erpIds.length > 0) {
      const customers = await this.customerModel
        .find({ erpId: { $in: erpIds } })
        .select("erpId name companyName")
        .lean()
        .exec();

      customerNameMap = new Map(
        (customers as any[]).map((c) => [
          c.erpId,
          c.companyName || c.name || "",
        ])
      );
    }

    return {
      data: data.map((doc) => {
        const customerName = customerNameMap.get(doc.erpId) ?? "";
        return this.mapToResponseDto(doc, customerName);
      }),
      total,
    };
  }

  async findOne(id: string): Promise<EDocCreditResponseDto> {
    const credit = await this.eDocCreditModel.findOne({ id }).lean().exec();
    if (!credit) {
      throw new NotFoundException(`E-Doc credit with id ${id} not found`);
    }
    return this.mapToResponseDto(credit);
  }

  async create(dto: CreateEDocCreditDto): Promise<EDocCreditResponseDto> {
    const id = this.generateId();
    const now = new Date();
    const total = dto.count * dto.price;

    const credit = new this.eDocCreditModel({
      ...dto,
      id,
      total,
      date: dto.date ? new Date(dto.date) : now,
      editDate: now,
      editUser: "system",
    });

    const saved = await credit.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateEDocCreditDto): Promise<EDocCreditResponseDto> {
    const updateData: Record<string, unknown> = { ...dto, editDate: new Date() };

    if (dto.date) {
      updateData.date = new Date(dto.date);
    }
    if (dto.invoiceDate) {
      updateData.invoiceDate = new Date(dto.invoiceDate);
    }

    // Recalculate total if price or count changed
    if (dto.price !== undefined || dto.count !== undefined) {
      const existing = await this.eDocCreditModel.findOne({ id }).lean().exec();
      if (existing) {
        const price = dto.price !== undefined ? dto.price : existing.price;
        const count = dto.count !== undefined ? dto.count : existing.count;
        updateData.total = count * price;
      }
    }

    const updated = await this.eDocCreditModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`E-Doc credit with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.eDocCreditModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`E-Doc credit with id ${id} not found`);
    }
  }

  private mapToResponseDto(credit: EDocCredit, customerName = ""): EDocCreditResponseDto {
    return {
      _id: credit._id.toString(),
      id: credit.id,
      erpId: credit.erpId || "",
      customerId: credit.customerId || "",
      customerName,
      price: credit.price || 0,
      count: credit.count || 0,
      total: credit.total || 0,
      currency: credit.currency || "tl",
      internalFirm: credit.internalFirm || "",
      date: credit.date,
      invoiceNumber: credit.invoiceNumber || "",
      invoiceUUID: credit.invoiceUUID || "",
      invoiceDate: credit.invoiceDate,
      grandTotal: credit.grandTotal || 0,
      taxTotal: credit.taxTotal || 0,
      invoiceNo: credit.invoiceNo || "",
      editDate: credit.editDate,
      editUser: credit.editUser || "",
      creatorId: credit.creatorId || "",
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}!?@${suffix}`;
  }
}
