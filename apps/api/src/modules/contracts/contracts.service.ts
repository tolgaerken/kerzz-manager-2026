import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, SortOrder } from "mongoose";
import { Contract, ContractDocument } from "./schemas/contract.schema";
import { ContractQueryDto } from "./dto/contract-query.dto";
import {
  PaginatedContractsResponseDto,
  ContractResponseDto
} from "./dto/contract-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>
  ) {}

  // Tarih bazlı filtreleme için yardımcı metod
  private getDateBasedFilter(
    flow: string
  ): FilterQuery<ContractDocument> | null {
    const now = new Date();

    switch (flow) {
      case "active":
        // Aktif: Başlangıç tarihi geçmiş VE bitiş tarihi gelmemiş
        return {
          startDate: { $lte: now },
          endDate: { $gte: now }
        };
      case "archive":
        // Arşiv: Bitiş tarihi geçmiş
        return {
          endDate: { $lt: now }
        };
      case "future":
        // Gelecek: Başlangıç tarihi henüz gelmemiş
        return {
          startDate: { $gt: now }
        };
      default:
        return null;
    }
  }

  async findAll(
    query: ContractQueryDto
  ): Promise<PaginatedContractsResponseDto> {
    const {
      page = 1,
      limit = 50,
      flow,
      yearly,
      search,
      sortField = "no",
      sortOrder = "desc"
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: FilterQuery<ContractDocument> = {};

    // Tarih bazlı flow filtresi
    if (flow && flow !== "all") {
      const dateFilter = this.getDateBasedFilter(flow);
      if (dateFilter) {
        filter = { ...filter, ...dateFilter };
      }
    }

    // Yearly/Monthly filter
    if (yearly !== undefined) {
      filter.yearly = yearly;
    }

    // Search filter - $or ile birleştir
    if (search) {
      const searchFilter = {
        $or: [
          { brand: { $regex: search, $options: "i" } },
          { company: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } }
        ]
      };

      // Eğer zaten $or varsa $and ile birleştir
      if (filter.$or) {
        filter = {
          $and: [{ $or: filter.$or }, searchFilter, ...Object.entries(filter)
            .filter(([key]) => key !== "$or")
            .map(([key, value]) => ({ [key]: value }))]
        };
      } else {
        filter = { ...filter, ...searchFilter };
      }
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      this.contractModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.contractModel.countDocuments(filter).exec(),
      this.getCounts()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      counts
    };
  }

  async findOne(id: string): Promise<ContractResponseDto | null> {
    const contract = await this.contractModel.findById(id).lean().exec();
    return contract ? this.mapToResponseDto(contract) : null;
  }

  private async getCounts(): Promise<PaginatedContractsResponseDto["counts"]> {
    const now = new Date();

    // Tarih bazlı count'lar
    const [active, archive, future, yearly, monthly] = await Promise.all([
      // Aktif: startDate <= now && endDate >= now
      this.contractModel
        .countDocuments({
          startDate: { $lte: now },
          endDate: { $gte: now }
        })
        .exec(),
      // Arşiv: endDate < now
      this.contractModel
        .countDocuments({
          endDate: { $lt: now }
        })
        .exec(),
      // Gelecek: startDate > now
      this.contractModel.countDocuments({ startDate: { $gt: now } }).exec(),
      // Yıllık
      this.contractModel.countDocuments({ yearly: true }).exec(),
      // Aylık
      this.contractModel.countDocuments({ yearly: false }).exec()
    ]);

    return { active, archive, future, yearly, monthly };
  }

  /**
   * Verilen licenseId'lerin aktif contract'a sahip olup olmadığını kontrol eder
   * @param licenseIds - Kontrol edilecek license ID'leri (string formatında)
   * @returns Aktif contract'a sahip licenseId'lerin Set'i
   */
  async getActiveLicenseIds(licenseIds: string[]): Promise<Set<string>> {
    if (licenseIds.length === 0) {
      return new Set();
    }

    const now = new Date();

    // Aktif contract'ları bul (startDate <= now && endDate >= now)
    const activeContracts = await this.contractModel
      .find({
        contractId: { $in: licenseIds },
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
      .select("contractId")
      .lean()
      .exec();

    return new Set(activeContracts.map((c) => c.contractId));
  }

  /**
   * Tek bir licenseId için aktif contract olup olmadığını kontrol eder
   */
  async hasActiveContract(licenseId: string): Promise<boolean> {
    const now = new Date();

    const count = await this.contractModel
      .countDocuments({
        contractId: licenseId,
        startDate: { $lte: now },
        endDate: { $gte: now }
      })
      .exec();

    return count > 0;
  }

  private mapToResponseDto(contract: Contract): ContractResponseDto {
    return {
      _id: contract._id.toString(),
      id: contract.id,
      brand: contract.brand,
      company: contract.company,
      contractFlow: contract.contractFlow,
      contractId: contract.contractId,
      description: contract.description,
      startDate: contract.startDate,
      endDate: contract.endDate,
      yearly: contract.yearly,
      yearlyTotal: contract.yearlyTotal,
      saasTotal: contract.saasTotal,
      total: contract.total,
      enabled: contract.enabled,
      blockedLicance: contract.blockedLicance,
      no: contract.no,
      customerId: contract.customerId,
      internalFirm: contract.internalFirm,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt
    };
  }
}
