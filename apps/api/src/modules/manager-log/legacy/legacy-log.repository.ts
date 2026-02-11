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
}
