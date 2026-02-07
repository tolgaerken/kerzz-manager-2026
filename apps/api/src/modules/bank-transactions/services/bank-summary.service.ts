import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  BankTransaction,
  BankTransactionDocument,
} from "../schemas/bank-transaction.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { BankSummaryResponseDto } from "../dto";

@Injectable()
export class BankSummaryService {
  constructor(
    @InjectModel(BankTransaction.name, CONTRACT_DB_CONNECTION)
    private readonly bankTransactionModel: Model<BankTransactionDocument>,
  ) {}

  async getSummary(
    startDate: string,
    endDate: string,
  ): Promise<BankSummaryResponseDto> {
    const dateFilter: Record<string, unknown> = {};

    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    const matchStage: Record<string, unknown> = {};
    if (Object.keys(dateFilter).length > 0) {
      matchStage.businessDate = dateFilter;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$bankAccId",
          bankAccName: { $first: "$bankAccName" },
          inflow: {
            $sum: {
              $cond: [{ $gt: ["$amount", 0] }, "$amount", 0],
            },
          },
          outflow: {
            $sum: {
              $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0],
            },
          },
          balance: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { bankAccName: 1 as const },
      },
    ];

    const results = await this.bankTransactionModel.aggregate(pipeline).exec();

    let totalInflow = 0;
    let totalOutflow = 0;
    let totalBalance = 0;
    let transactionCount = 0;

    const summaries = results.map((r) => {
      totalInflow += r.inflow;
      totalOutflow += r.outflow;
      totalBalance += r.balance;
      transactionCount += r.count;

      return {
        bankAccId: r._id ?? "",
        bankAccName: r.bankAccName ?? r._id ?? "",
        inflow: r.inflow,
        outflow: r.outflow,
        balance: r.balance,
      };
    });

    return {
      summaries,
      totalInflow,
      totalOutflow,
      totalBalance,
      transactionCount,
    };
  }
}
