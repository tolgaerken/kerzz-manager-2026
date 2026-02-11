import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ManagerLogQueryDto } from "../dto";
import { CONTRACT_DB_CONNECTION } from "../../../database";
import { LegacyLog, LegacyLogDocument } from "./legacy-log.schema";
import type { LegacyLogType } from "./legacy-log.types";

type LegacyContextIdField = "contractId" | "licenceId" | "saleId" | "customerId";

@Injectable()
export class LegacyLogRepository {
  constructor(
    @InjectModel(LegacyLog.name, CONTRACT_DB_CONNECTION)
    private readonly legacyLogModel: Model<LegacyLogDocument>
  ) {}

  async findAllByQuery(query: ManagerLogQueryDto): Promise<LegacyLogDocument[]> {
    const filter = this.buildFilter(query);
    if (!filter) {
      return [];
    }

    return this.legacyLogModel.find(filter).sort({ date: -1 }).exec();
  }

  async countByQuery(query: ManagerLogQueryDto): Promise<number> {
    const filter = this.buildFilter(query);
    if (!filter) {
      return 0;
    }

    return this.legacyLogModel.countDocuments(filter).exec();
  }

  private buildFilter(query: ManagerLogQueryDto): Record<string, unknown> | null {
    const filter: Record<string, unknown> = {};

    if (query.customerId) {
      filter.customerId = query.customerId;
    }

    if (query.contextType) {
      const legacyType = this.mapManagerContextToLegacyType(query.contextType);
      if (!legacyType) {
        return null;
      }
      filter.logType = legacyType;
    }

    if (query.contextId) {
      const idField = this.mapManagerContextToLegacyContextField(query.contextType);
      if (!idField) {
        return null;
      }
      filter[idField] = query.contextId;
    }

    return filter;
  }

  private mapManagerContextToLegacyType(contextType?: string): LegacyLogType | null {
    if (!contextType) {
      return null;
    }

    const mapping: Record<string, LegacyLogType> = {
      contract: "contract",
      license: "licence",
      sale: "sale",
      customer: "customer",
      invoice: "invoice",
      "payment-plan": "payment",
    };

    return mapping[contextType] ?? null;
  }

  private mapManagerContextToLegacyContextField(contextType?: string): LegacyContextIdField | null {
    if (!contextType) {
      return null;
    }

    const mapping: Record<string, LegacyContextIdField> = {
      contract: "contractId",
      license: "licenceId",
      sale: "saleId",
      customer: "customerId",
    };

    return mapping[contextType] ?? null;
  }

  /**
   * Son 5 gün için tarih filtresi oluşturur.
   * Badge için 5+ gün öncesi zaten "5+" olarak gösterildiğinden
   * daha eski logları sorgulamaya gerek yok.
   */
  private getRecentDateFilter(): Date {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);
    return fiveDaysAgo;
  }

  /**
   * Birden fazla contractId için son log tarihlerini batch olarak getirir.
   * Performans için sadece son 5 günü sorgular.
   * @returns Record<contractId, Date>
   */
  async findLastLogDatesByContractIds(
    contractIds: string[]
  ): Promise<Record<string, Date>> {
    if (!contractIds || contractIds.length === 0) {
      return {};
    }

    const recentDate = this.getRecentDateFilter();

    const results = await this.legacyLogModel.aggregate<{
      _id: string;
      lastLogAt: Date;
    }>([
      {
        $match: {
          contractId: { $in: contractIds },
          date: { $gte: recentDate },
        },
      },
      {
        $group: {
          _id: "$contractId",
          lastLogAt: { $max: "$date" },
        },
      },
    ]);

    const response: Record<string, Date> = {};
    for (const item of results) {
      response[item._id] = item.lastLogAt;
    }

    return response;
  }

  /**
   * Birden fazla customerId için son log tarihlerini batch olarak getirir.
   * Performans için sadece son 5 günü sorgular.
   * @returns Record<customerId, Date>
   */
  async findLastLogDatesByCustomerIds(
    customerIds: string[]
  ): Promise<Record<string, Date>> {
    if (!customerIds || customerIds.length === 0) {
      return {};
    }

    const recentDate = this.getRecentDateFilter();

    const results = await this.legacyLogModel.aggregate<{
      _id: string;
      lastLogAt: Date;
    }>([
      {
        $match: {
          customerId: { $in: customerIds },
          date: { $gte: recentDate },
        },
      },
      {
        $group: {
          _id: "$customerId",
          lastLogAt: { $max: "$date" },
        },
      },
    ]);

    const response: Record<string, Date> = {};
    for (const item of results) {
      response[item._id] = item.lastLogAt;
    }

    return response;
  }
}
