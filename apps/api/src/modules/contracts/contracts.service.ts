import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { Contract, ContractDocument } from "./schemas/contract.schema";
import {
  Customer,
  CustomerDocument
} from "../customers/schemas/customer.schema";
import { ContractPaymentsService } from "../contract-payments/contract-payments.service";
import { ContractQueryDto } from "./dto/contract-query.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import {
  PaginatedContractsResponseDto,
  ContractResponseDto
} from "./dto/contract-response.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { randomBytes } from "crypto";
import {
  getActiveContractFilter,
  getContractDateFilter,
  getMonthBoundaries
} from "./utils/contract-date.utils";

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name, CONTRACT_DB_CONNECTION)
    private contractModel: Model<ContractDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    private readonly contractPaymentsService: ContractPaymentsService
  ) {}

  // Tarih bazlı filtreleme için yardımcı metod
  private getDateBasedFilter(
    flow: string
  ): Record<string, any> | null {
    return getContractDateFilter(flow);
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

    // Flow filtresi
    if (flow && flow !== "all") {
      if (flow === "free") {
        filter.isFree = true;
      } else {
        const dateFilter = this.getDateBasedFilter(flow);
        if (dateFilter) {
          filter = { ...filter, ...dateFilter };
        }
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
    const { monthStart, monthEnd } = getMonthBoundaries(now);

    // Tarih bazlı count'lar
    const [active, archive, future, free, yearly, monthly] = await Promise.all([
      // Aktif: startDate <= now && endDate >= now
      this.contractModel
        .countDocuments(getActiveContractFilter(now))
        .exec(),
      // Arşiv: endDate < ay baslangici
      this.contractModel
        .countDocuments({
          endDate: { $lt: monthStart }
        })
        .exec(),
      // Gelecek: startDate > ay bitisi
      this.contractModel.countDocuments({ startDate: { $gt: monthEnd } }).exec(),
      // Ücretsiz
      this.contractModel.countDocuments({ isFree: true }).exec(),
      // Yıllık
      this.contractModel.countDocuments({ yearly: true }).exec(),
      // Aylık
      this.contractModel.countDocuments({ yearly: false }).exec()
    ]);

    return { active, archive, future, free, yearly, monthly };
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
    const activeFilter = getActiveContractFilter(now);

    // Aktif contract'ları bul (startDate <= now && endDate >= now)
    const activeContracts = await this.contractModel
      .find({
        contractId: { $in: licenseIds },
        ...activeFilter
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
    const activeFilter = getActiveContractFilter(now);

    const count = await this.contractModel
      .countDocuments({
        contractId: licenseId,
        ...activeFilter
      })
      .exec();

    return count > 0;
  }

  /**
   * Yeni kontrat oluşturur
   */
  async create(dto: CreateContractDto): Promise<ContractResponseDto> {
    // Get next contract number and customer info in parallel
    const [maxNo, customer] = await Promise.all([
      this.getMaxContractNo(),
      this.customerModel
        .findOne({ id: dto.customerId })
        .select("name brand")
        .lean()
        .exec()
    ]);
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
      contractFlow: dto.contractFlow || "future",
      isActive: dto.isActive ?? true,
      // Populate from customer data
      brand: customer?.brand || "",
      company: customer?.name || "",
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
   * Kontrat günceller
   */
  async update(
    id: string,
    dto: UpdateContractDto
  ): Promise<ContractResponseDto | null> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    // DTO'dan gelen alanları güncelleme verisine ekle
    if (dto.customerId !== undefined) updateData.customerId = dto.customerId;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.startDate !== undefined)
      updateData.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
    if (dto.noEndDate !== undefined) updateData.noEndDate = dto.noEndDate;
    if (dto.internalFirm !== undefined)
      updateData.internalFirm = dto.internalFirm;
    if (dto.yearly !== undefined) updateData.yearly = dto.yearly;
    if (dto.maturity !== undefined) updateData.maturity = dto.maturity;
    if (dto.lateFeeType !== undefined) updateData.lateFeeType = dto.lateFeeType;
    if (dto.incraseRateType !== undefined)
      updateData.incraseRateType = dto.incraseRateType;
    if (dto.incrasePeriod !== undefined) {
      updateData.incrasePeriod = dto.incrasePeriod;
      updateData.incrasePeriood = dto.incrasePeriod;
    }
    if (dto.noVat !== undefined) updateData.noVat = dto.noVat;
    if (dto.noNotification !== undefined)
      updateData.noNotification = dto.noNotification;
    if (dto.contractFlow !== undefined)
      updateData.contractFlow = dto.contractFlow;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.contractModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .lean()
      .exec();

    return updated ? this.mapToResponseDto(updated) : null;
  }

  /**
   * Kontratı ve ilişkili ödeme planlarını siler
   * @returns Silinen kontrat ve ödeme planı bilgisi
   */
  async delete(
    id: string
  ): Promise<{ deletedPaymentPlans: number }> {
    const contract = await this.contractModel.findById(id).lean().exec();
    if (!contract) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }

    // Önce ilişkili ödeme planlarını sil (contract.id string field)
    const deletedPaymentPlans =
      await this.contractPaymentsService.deleteByContractId(contract.id);

    // Sonra kontratı sil
    await this.contractModel.findByIdAndDelete(id).exec();

    return { deletedPaymentPlans };
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
      isFree: contract.isFree,
      isActive: contract.isActive ?? true,
      no: contract.no,
      customerId: contract.customerId,
      internalFirm: contract.internalFirm,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt
    };
  }
}
