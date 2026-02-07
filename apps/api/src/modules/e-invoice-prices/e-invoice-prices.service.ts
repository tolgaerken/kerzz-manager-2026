import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  EInvoicePrice,
  EInvoicePriceDocument,
} from "./schemas/e-invoice-price.schema";
import {
  EInvoicePriceQueryDto,
  CreateEInvoicePriceDto,
  UpdateEInvoicePriceDto,
  BulkUpsertItemDto,
  EInvoicePriceResponseDto,
  EInvoicePricesListResponseDto,
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class EInvoicePricesService {
  constructor(
    @InjectModel(EInvoicePrice.name, CONTRACT_DB_CONNECTION)
    private readonly model: Model<EInvoicePriceDocument>,
  ) {}

  // ──────────────────────────── List ────────────────────────────
  async findAll(
    query: EInvoicePriceQueryDto,
  ): Promise<EInvoicePricesListResponseDto> {
    const filter: Record<string, unknown> = {};

    // customerErpId filtresi
    if (query.customerErpId !== undefined) {
      filter.customerErpId = query.customerErpId;
    }

    // Arama
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { erpId: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortField = query.sortField || "sequence";
    const sortOrder = query.sortOrder === "desc" ? -1 : 1;

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((doc) => this.toResponse(doc)),
      total,
    };
  }

  // ──────────────────────────── Single ────────────────────────────
  async findOne(id: string): Promise<EInvoicePriceResponseDto> {
    const doc = await this.model.findOne({ id }).lean().exec();
    if (!doc) {
      throw new NotFoundException(
        `E-Fatura fiyat kaydı bulunamadı: ${id}`,
      );
    }
    return this.toResponse(doc);
  }

  // ──────────────────────────── Create ────────────────────────────
  async create(
    dto: CreateEInvoicePriceDto,
  ): Promise<EInvoicePriceResponseDto> {
    const id = this.generateId();
    const totalPrice = this.calculateTotal(
      dto.unitPrice,
      dto.quantity ?? 0,
      dto.discountRate ?? 0,
    );

    const record = new this.model({
      ...dto,
      id,
      totalPrice,
      discountRate: dto.discountRate ?? 0,
      quantity: dto.quantity ?? 0,
      isCredit: dto.isCredit ?? false,
      customerErpId: dto.customerErpId ?? "",
      sequence: dto.sequence ?? 0,
    });

    const saved = await record.save();
    return this.toResponse(saved.toObject());
  }

  // ──────────────────────────── Update ────────────────────────────
  async update(
    id: string,
    dto: UpdateEInvoicePriceDto,
  ): Promise<EInvoicePriceResponseDto> {
    const existing = await this.model.findOne({ id }).lean().exec();
    if (!existing) {
      throw new NotFoundException(
        `E-Fatura fiyat kaydı bulunamadı: ${id}`,
      );
    }

    const unitPrice =
      dto.unitPrice !== undefined ? dto.unitPrice : existing.unitPrice;
    const quantity =
      dto.quantity !== undefined ? dto.quantity : existing.quantity;
    const discountRate =
      dto.discountRate !== undefined
        ? dto.discountRate
        : existing.discountRate;

    const totalPrice = this.calculateTotal(unitPrice, quantity, discountRate);

    const updated = await this.model
      .findOneAndUpdate(
        { id },
        { ...dto, totalPrice },
        { new: true },
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `E-Fatura fiyat kaydı bulunamadı: ${id}`,
      );
    }

    return this.toResponse(updated);
  }

  // ──────────────────────────── Delete ────────────────────────────
  async delete(id: string): Promise<void> {
    const result = await this.model.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `E-Fatura fiyat kaydı bulunamadı: ${id}`,
      );
    }
  }

  // ──────────────────────── Bulk Upsert ───────────────────────────
  async bulkUpsert(
    items: BulkUpsertItemDto[],
  ): Promise<EInvoicePricesListResponseDto> {
    const ops = items.map((item) => {
      const id = item.id || this.generateId();
      const totalPrice = this.calculateTotal(
        item.unitPrice,
        item.quantity ?? 0,
        item.discountRate ?? 0,
      );

      return {
        updateOne: {
          filter: { id },
          update: {
            $set: {
              ...item,
              id,
              totalPrice,
              discountRate: item.discountRate ?? 0,
              quantity: item.quantity ?? 0,
              isCredit: item.isCredit ?? false,
              customerErpId: item.customerErpId ?? "",
              sequence: item.sequence ?? 0,
              updatedAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      };
    });

    if (ops.length > 0) {
      await this.model.bulkWrite(ops);
    }

    // Kaydedilen verileri dön
    const customerErpId = items[0]?.customerErpId ?? "";
    return this.findAll({ customerErpId });
  }

  // ──────────────── Delete by Customer ERP ID ─────────────────────
  async deleteByCustomerErpId(customerErpId: string): Promise<void> {
    await this.model.deleteMany({ customerErpId }).exec();
  }

  // ──────────────────────── Helpers ───────────────────────────────
  private calculateTotal(
    unitPrice: number,
    quantity: number,
    discountRate: number,
  ): number {
    const base = unitPrice * quantity;
    const discount = base * (discountRate / 100);
    return Math.round((base - discount) * 100) / 100;
  }

  private toResponse(doc: any): EInvoicePriceResponseDto {
    return {
      _id: doc._id?.toString() ?? "",
      id: doc.id ?? "",
      sequence: doc.sequence ?? 0,
      name: doc.name ?? "",
      erpId: doc.erpId ?? "",
      unitPrice: doc.unitPrice ?? 0,
      discountRate: doc.discountRate ?? 0,
      quantity: doc.quantity ?? 0,
      totalPrice: doc.totalPrice ?? 0,
      isCredit: doc.isCredit ?? false,
      customerErpId: doc.customerErpId ?? "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private generateId(): string {
    const uuid = crypto.randomUUID();
    const suffix = Math.random().toString(16).substring(2, 6);
    return `${uuid}-${suffix}`;
  }
}
