import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  BankTransaction,
  BankTransactionDocument,
} from "../schemas/bank-transaction.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import {
  BankTransactionQueryDto,
  UpdateBankTransactionDto,
  BankTransactionResponseDto,
  BankTransactionsListResponseDto,
} from "../dto";

@Injectable()
export class BankTransactionsService {
  constructor(
    @InjectModel(BankTransaction.name, CONTRACT_DB_CONNECTION)
    private readonly bankTransactionModel: Model<BankTransactionDocument>,
  ) {}

  async findAll(
    query: BankTransactionQueryDto,
  ): Promise<BankTransactionsListResponseDto> {
    const { startDate, endDate, bankAccId, erpStatus, page = 1, limit = 500 } = query;

    const filter: Record<string, unknown> = {};

    // Tarih filtresi
    if (startDate || endDate) {
      filter.businessDate = {};
      if (startDate) {
        (filter.businessDate as Record<string, unknown>).$gte = new Date(startDate);
      }
      if (endDate) {
        (filter.businessDate as Record<string, unknown>).$lte = new Date(endDate);
      }
    }

    if (bankAccId) {
      filter.bankAccId = bankAccId;
    }

    if (erpStatus) {
      filter.erpStatus = erpStatus;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bankTransactionModel
        .find(filter)
        .sort({ businessDate: -1, createDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.bankTransactionModel.countDocuments(filter).exec(),
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total,
    };
  }

  async findOne(id: string): Promise<BankTransactionResponseDto> {
    const transaction = await this.bankTransactionModel
      .findOne({ id })
      .lean()
      .exec();

    if (!transaction) {
      throw new NotFoundException(
        `Bank transaction with id ${id} not found`,
      );
    }

    return this.mapToResponseDto(transaction);
  }

  async update(
    id: string,
    dto: UpdateBankTransactionDto,
  ): Promise<BankTransactionResponseDto> {
    // "success" durumundaki islemler guncellenmez
    const existing = await this.bankTransactionModel
      .findOne({ id })
      .lean()
      .exec();

    if (!existing) {
      throw new NotFoundException(
        `Bank transaction with id ${id} not found`,
      );
    }

    if (existing.erpStatus === "success" && dto.erpStatus && dto.erpStatus !== "success") {
      // success durumundaki islem tekrar degistirilemez
      return this.mapToResponseDto(existing);
    }

    const updated = await this.bankTransactionModel
      .findOneAndUpdate({ id }, { $set: dto }, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Bank transaction with id ${id} not found`,
      );
    }

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(
    doc: BankTransaction,
  ): BankTransactionResponseDto {
    return {
      _id: doc._id?.toString() ?? "",
      id: doc.id ?? "",
      accountId: doc.accountId ?? "",
      name: doc.name ?? "",
      dc: doc.dc ?? "",
      code: doc.code ?? "",
      amount: doc.amount ?? 0,
      balance: doc.balance ?? 0,
      description: doc.description ?? "",
      businessDate: doc.businessDate,
      createDate: doc.createDate,
      opponentId: doc.opponentId ?? "",
      opponentIban: doc.opponentIban ?? "",
      sourceId: doc.sourceId ?? "",
      source: doc.source ?? "",
      bankAccId: doc.bankAccId ?? "",
      bankAccName: doc.bankAccName ?? "",
      bankId: doc.bankId ?? "",
      bankName: doc.bankName ?? "",
      erpStatus: doc.erpStatus ?? "waiting",
      erpMessage: doc.erpMessage ?? "",
      erpGlAccountCode: doc.erpGlAccountCode ?? "",
      erpAccountCode: doc.erpAccountCode ?? "",
    };
  }
}
