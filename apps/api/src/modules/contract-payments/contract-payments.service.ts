import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ContractPayment, ContractPaymentDocument } from "./schemas/contract-payment.schema";
import {
  ContractPaymentQueryDto,
  CreateContractPaymentDto,
  UpdateContractPaymentDto,
  ContractPaymentResponseDto,
  ContractPaymentsListResponseDto
} from "./dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { generatePaymentId } from "./utils/id-generator";

@Injectable()
export class ContractPaymentsService {
  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private contractPaymentModel: Model<ContractPaymentDocument>
  ) {}

  async findAll(query: ContractPaymentQueryDto): Promise<ContractPaymentsListResponseDto> {
    const { contractId, paid } = query;

    const filter: Record<string, unknown> = { contractId };
    if (paid !== undefined) {
      filter.paid = paid;
    }

    const [data, total] = await Promise.all([
      this.contractPaymentModel.find(filter).sort({ payDate: 1 }).lean().exec(),
      this.contractPaymentModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<ContractPaymentResponseDto> {
    const payment = await this.contractPaymentModel.findOne({ id }).lean().exec();
    if (!payment) {
      throw new NotFoundException(`Contract payment with id ${id} not found`);
    }
    return this.mapToResponseDto(payment);
  }

  async create(dto: CreateContractPaymentDto): Promise<ContractPaymentResponseDto> {
    const id = generatePaymentId();
    const now = new Date();

    const payment = new this.contractPaymentModel({
      ...dto,
      id,
      payDate: dto.payDate ? new Date(dto.payDate) : now,
      editDate: now,
      editUser: "system"
    });

    const saved = await payment.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, dto: UpdateContractPaymentDto): Promise<ContractPaymentResponseDto> {
    const updateData: Record<string, unknown> = { ...dto, editDate: new Date() };
    
    if (dto.payDate) {
      updateData.payDate = new Date(dto.payDate);
    }
    if (dto.paymentDate) {
      updateData.paymentDate = new Date(dto.paymentDate);
    }
    if (dto.invoiceDate) {
      updateData.invoiceDate = new Date(dto.invoiceDate);
    }

    const updated = await this.contractPaymentModel
      .findOneAndUpdate(
        { id },
        updateData,
        { new: true }
      )
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`Contract payment with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.contractPaymentModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Contract payment with id ${id} not found`);
    }
  }

  /**
   * Bir kontrata ait tüm ödeme planlarını siler
   * @returns Silinen kayıt sayısı
   */
  async deleteByContractId(contractId: string): Promise<number> {
    const result = await this.contractPaymentModel
      .deleteMany({ contractId })
      .exec();
    return result.deletedCount;
  }

  private mapToResponseDto(payment: ContractPayment): ContractPaymentResponseDto {
    return {
      _id: payment._id.toString(),
      id: payment.id,
      contractId: payment.contractId,
      company: payment.company || "",
      brand: payment.brand || "",
      customerId: payment.customerId || "",
      licanceId: payment.licanceId || "",
      invoiceNo: payment.invoiceNo || "",
      paid: payment.paid || false,
      payDate: payment.payDate,
      paymentDate: payment.paymentDate,
      invoiceDate: payment.invoiceDate,
      total: payment.total || 0,
      invoiceTotal: payment.invoiceTotal || 0,
      balance: payment.balance || 0,
      list: payment.list || [],
      yearly: payment.yearly || false,
      eInvoice: payment.eInvoice || false,
      uuid: payment.uuid || "",
      ref: payment.ref || "",
      taxNo: payment.taxNo || "",
      internalFirm: payment.internalFirm || "",
      contractNumber: payment.contractNumber || 0,
      segment: payment.segment || "",
      block: payment.block || false,
      editDate: payment.editDate,
      editUser: payment.editUser || "",
      // Kist (prorated) odeme alanlari
      type: payment.type as "regular" | "prorated" | undefined,
      proratedDays: payment.proratedDays,
      proratedStartDate: payment.proratedStartDate,
      sourceItemId: payment.sourceItemId
    };
  }

}
