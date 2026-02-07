import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Contract, ContractDocument } from "./schemas/contract.schema";
import { ContractQueryDto } from "./dto/contract-query.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import {
  PaginatedContractsResponseDto,
  ContractResponseDto
} from "./dto/contract-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { randomBytes } from "crypto";

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>
  ) {}

  // Tarih bazlı filtreleme için yardımcı metod
  private getDateBasedFilter(
    flow: string
  ): Record<string, any> | null {
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
      limit,
      flow,
      yearly,
      search,
      sortField = "no",
      sortOrder = "desc"
    } = query;

    // Build filter query
    let filter: Record<string, any> = {};

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

    // Build query - limit varsa pagination uygula, yoksa tüm verileri getir
    let dataQuery = this.contractModel.find(filter).sort(sort);

    if (limit) {
      const skip = (page - 1) * limit;
      dataQuery = dataQuery.skip(skip).limit(limit);
    }

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      dataQuery.lean().exec(),
      this.contractModel.countDocuments(filter).exec(),
      this.getCounts()
    ]);

    const effectiveLimit = limit || total;
    const totalPages = effectiveLimit > 0 ? Math.ceil(total / effectiveLimit) : 1;

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        total,
        page,
        limit: effectiveLimit,
        totalPages,
        hasNextPage: limit ? page < totalPages : false,
        hasPrevPage: limit ? page > 1 : false
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

  /**
   * Yeni kontrat oluşturur
   */
  async create(dto: CreateContractDto): Promise<ContractResponseDto> {
    // Get next contract number
    const maxNo = await this.getMaxContractNo();
    const newNo = maxNo + 1;

    // Generate unique IDs
    const id = this.generateId();
    const contractId = this.generateShortId();

    const now = new Date();

    const contractData: Partial<Contract> = {
      id,
      contractId,
      no: newNo,
      customerId: dto.customerId,
      description: dto.description || "",
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      noEndDate: dto.noEndDate ?? true,
      internalFirm: dto.internalFirm || "",
      yearly: dto.yearly ?? false,
      maturity: dto.maturity ?? 0,
      lateFeeType: dto.lateFeeType || "yi-ufe",
      incraseRateType: dto.incraseRateType || "yi-ufe",
      incrasePeriod: dto.incrasePeriod || "3-month",
      incrasePeriood: dto.incrasePeriod || "3-month",
      noVat: dto.noVat ?? false,
      noNotification: dto.noNotification ?? false,
      // Default values
      brand: "",
      company: "",
      contractFlow: "future",
      total: 0,
      yearlyTotal: 0,
      supportTotal: 0,
      cashRegisterTotal: 0,
      saasTotal: 0,
      versionTotal: 0,
      itemsTotal: 0,
      erpBalance: 0,
      enabled: false,
      blockedLicance: false,
      isFree: false,
      hasLog: false,
      onlineCheck: false,
      isExtendable: false,
      lateFee: 0,
      incraseRate: 0,
      latePayment: 0,
      parentTotal: 0,
      paymentLength: 0,
      licanceStatus: 0,
      notify: 0,
      createdAt: now,
      updatedAt: now
    };

    const contract = new this.contractModel(contractData);
    const saved = await contract.save();

    return this.mapToResponseDto(saved.toObject());
  }

  /**
   * En yüksek kontrat numarasını getirir
   */
  private async getMaxContractNo(): Promise<number> {
    const result = await this.contractModel
      .findOne()
      .sort({ no: -1 })
      .select("no")
      .lean()
      .exec();

    return result?.no || 0;
  }

  /**
   * Benzersiz ID üretir (24 karakter hex)
   */
  private generateId(): string {
    return randomBytes(12).toString("hex");
  }

  /**
   * Kısa benzersiz ID üretir (8 karakter)
   */
  private generateShortId(): string {
    return randomBytes(4).toString("hex");
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
