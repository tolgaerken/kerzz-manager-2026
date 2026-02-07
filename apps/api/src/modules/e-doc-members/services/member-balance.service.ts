import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  EDocTransaction,
  EDocTransactionDocument,
} from "../schemas/e-doc-transaction.schema";
import { MemberBalanceDto } from "../dto";
import { HELPERS_DB_CONNECTION } from "../../../database/helpers-database.module";

interface BalanceResult {
  creditBalance: number;
  totalCharge: number;
  totalConsumption: number;
  monthlyAverage: number;
}

@Injectable()
export class MemberBalanceService {
  constructor(
    @InjectModel(EDocTransaction.name, HELPERS_DB_CONNECTION)
    private transactionModel: Model<EDocTransactionDocument>,
  ) {}

  /**
   * Verilen erpId listesi için kredi bakiyelerini hesaplar
   */
  async calculateBalances(
    erpIds: string[],
  ): Promise<Map<string, BalanceResult>> {
    const result = new Map<string, BalanceResult>();

    if (erpIds.length === 0) return result;

    const transactions = await this.transactionModel
      .find({ erpId: { $in: erpIds } })
      .select("erpId amount transactionDate")
      .lean()
      .exec();

    for (const erpId of erpIds) {
      const memberTx = transactions.filter((tx) => tx.erpId === erpId);

      const totalCharge = memberTx
        .filter((tx) => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalConsumption = memberTx
        .filter((tx) => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const creditBalance = memberTx.reduce(
        (sum, tx) => sum + tx.amount,
        0,
      );

      const monthlyAverage = this.calcMonthlyAverage(memberTx);

      result.set(erpId, {
        creditBalance,
        totalCharge,
        totalConsumption,
        monthlyAverage,
      });
    }

    return result;
  }

  /**
   * Tüm üyeler için bakiyeleri döner (GET /balances endpoint'i için)
   */
  async getAllBalances(erpIds: string[]): Promise<MemberBalanceDto[]> {
    const balanceMap = await this.calculateBalances(erpIds);
    const balances: MemberBalanceDto[] = [];

    for (const [erpId, balance] of balanceMap) {
      balances.push({
        erpId,
        ...balance,
      });
    }

    return balances;
  }

  /**
   * Son 12 ayda harcanan kontörlerin aylık ortalamasını hesaplar
   */
  private calcMonthlyAverage(
    transactions: Array<{ amount: number; transactionDate: Date }>,
  ): number {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const recentConsumption = transactions.filter(
      (tx) =>
        tx.amount < 0 && new Date(tx.transactionDate) >= oneYearAgo,
    );

    const totalConsumption = recentConsumption.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );

    // Benzersiz ay sayısını hesapla
    const uniqueMonths = new Set(
      recentConsumption.map((tx) =>
        new Date(tx.transactionDate).toISOString().slice(0, 7),
      ),
    ).size;

    return uniqueMonths > 0 ? totalConsumption / uniqueMonths : 0;
  }
}
