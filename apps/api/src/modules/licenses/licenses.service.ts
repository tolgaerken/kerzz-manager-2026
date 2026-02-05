import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, SortOrder } from "mongoose";
import { License, LicenseDocument } from "./schemas/license.schema";
import { LicenseQueryDto } from "./dto/license-query.dto";
import {
  PaginatedLicensesResponseDto,
  LicenseResponseDto,
  LicenseCountsDto
} from "./dto/license-response.dto";
import { CreateLicenseDto } from "./dto/create-license.dto";
import { UpdateLicenseDto } from "./dto/update-license.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { ContractsService } from "../contracts/contracts.service";

@Injectable()
export class LicensesService {
  constructor(
    @InjectModel(License.name, CONTRACT_DB_CONNECTION)
    private licenseModel: Model<LicenseDocument>,
    private contractsService: ContractsService
  ) {}

  async findAll(query: LicenseQueryDto): Promise<PaginatedLicensesResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      type,
      companyType,
      category,
      active,
      block,
      haveContract,
      customerId,
      sortField = "licenseId",
      sortOrder = "desc"
    } = query;

    const skip = (page - 1) * limit;

    // Build filter query
    let filter: FilterQuery<LicenseDocument> = {};

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Company type filter
    if (companyType) {
      filter.companyType = companyType;
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Active filter
    if (active !== undefined) {
      filter.active = active;
    }

    // Block filter
    if (block !== undefined) {
      filter.block = block;
    }

    // Have contract filter
    if (haveContract !== undefined) {
      filter.haveContract = haveContract;
    }

    // Customer filter
    if (customerId) {
      filter.customerId = customerId;
    }

    // Search filter
    if (search) {
      const searchFilter = {
        $or: [
          { brandName: { $regex: search, $options: "i" } },
          { customerName: { $regex: search, $options: "i" } },
          { SearchItem: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };

      // Check if licenseId is a number search
      const licenseIdSearch = parseInt(search, 10);
      if (!isNaN(licenseIdSearch)) {
        searchFilter.$or.push({ licenseId: licenseIdSearch } as any);
      }

      filter = { ...filter, ...searchFilter };
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    // Execute queries in parallel
    const [data, total, counts] = await Promise.all([
      this.licenseModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.licenseModel.countDocuments(filter).exec(),
      this.getCounts()
    ]);

    // Tüm lisans ID'lerini topla ve aktif contract kontrolü yap
    const licenseIds = data.map((doc) => doc.licenseId.toString());
    const activeLicenseIds = await this.contractsService.getActiveLicenseIds(licenseIds);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc, activeLicenseIds.has(doc.licenseId.toString()))),
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      counts
    };
  }

  async findOne(id: string): Promise<LicenseResponseDto> {
    const license = await this.licenseModel.findById(id).lean().exec();
    if (!license) {
      throw new NotFoundException(`Lisans bulunamadı: ${id}`);
    }

    // Aktif contract kontrolü
    const hasActiveContract = await this.contractsService.hasActiveContract(
      license.licenseId.toString()
    );

    return this.mapToResponseDto(license, hasActiveContract);
  }

  async create(createDto: CreateLicenseDto): Promise<LicenseResponseDto> {
    // Generate next license ID
    const nextLicenseId = await this.generateNextLicenseId();

    // Build SearchItem
    const typeLabel = this.getTypeLabel(createDto.type || "kerzz-pos");
    const searchItem = `[${typeLabel}] ${createDto.brandName} (${nextLicenseId})`;

    const licenseData = {
      ...createDto,
      id: nextLicenseId.toString(),
      licenseId: nextLicenseId,
      creation: new Date(),
      SearchItem: searchItem,
      address: createDto.address || {
        address: "",
        cityId: 0,
        city: "",
        townId: 0,
        town: "",
        countryId: "",
        country: ""
      },
      orwiStore: createDto.orwiStore || {
        id: "",
        name: "",
        cloudId: ""
      }
    };

    const license = new this.licenseModel(licenseData);
    const saved = await license.save();
    // Yeni oluşturulan lisansın henüz aktif contract'ı olmayacak
    return this.mapToResponseDto(saved.toObject(), false);
  }

  async update(id: string, updateDto: UpdateLicenseDto): Promise<LicenseResponseDto> {
    // Fetch current license for SearchItem update
    const current = await this.licenseModel.findById(id).lean().exec();
    if (!current) {
      throw new NotFoundException(`Lisans bulunamadı: ${id}`);
    }

    // Update SearchItem if brandName or type changed
    let updateData: any = { ...updateDto };
    if (updateDto.brandName || updateDto.type) {
      const typeLabel = this.getTypeLabel(updateDto.type || current.type);
      const brandName = updateDto.brandName || current.brandName;
      updateData.SearchItem = `[${typeLabel}] ${brandName} (${current.licenseId})`;
    }

    const license = await this.licenseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .lean()
      .exec();

    if (!license) {
      throw new NotFoundException(`Lisans bulunamadı: ${id}`);
    }

    // Aktif contract kontrolü
    const hasActiveContract = await this.contractsService.hasActiveContract(
      license.licenseId.toString()
    );

    return this.mapToResponseDto(license, hasActiveContract);
  }

  async remove(id: string): Promise<void> {
    const result = await this.licenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Lisans bulunamadı: ${id}`);
    }
  }

  private async generateNextLicenseId(): Promise<number> {
    const lastLicense = await this.licenseModel
      .findOne({})
      .sort({ licenseId: -1 })
      .select("licenseId")
      .lean()
      .exec();

    return (lastLicense?.licenseId || 0) + 1;
  }

  private getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      "kerzz-pos": "Kerzz POS",
      "orwi-pos": "Orwi POS",
      "kerzz-cloud": "Kerzz Cloud"
    };
    return labels[type] || "*";
  }

  private async getCounts(): Promise<LicenseCountsDto> {
    const [
      total,
      active,
      blocked,
      withContract,
      kerzzPos,
      orwiPos,
      kerzzCloud,
      chain,
      single,
      belediye,
      unv
    ] = await Promise.all([
      this.licenseModel.countDocuments({}).exec(),
      this.licenseModel.countDocuments({ active: true }).exec(),
      this.licenseModel.countDocuments({ block: true }).exec(),
      this.licenseModel.countDocuments({ haveContract: true }).exec(),
      this.licenseModel.countDocuments({ type: "kerzz-pos" }).exec(),
      this.licenseModel.countDocuments({ type: "orwi-pos" }).exec(),
      this.licenseModel.countDocuments({ type: "kerzz-cloud" }).exec(),
      this.licenseModel.countDocuments({ companyType: "chain" }).exec(),
      this.licenseModel.countDocuments({ companyType: "single" }).exec(),
      this.licenseModel.countDocuments({ companyType: "belediye" }).exec(),
      this.licenseModel.countDocuments({ companyType: "unv" }).exec()
    ]);

    return {
      total,
      active,
      blocked,
      withContract,
      byType: {
        kerzzPos,
        orwiPos,
        kerzzCloud
      },
      byCompanyType: {
        chain,
        single,
        belediye,
        unv
      }
    };
  }

  private mapToResponseDto(license: License, haveContract: boolean): LicenseResponseDto {
    return {
      _id: license._id.toString(),
      id: license.id,
      no: license.no,
      creation: license.creation,
      customerId: license.customerId,
      customerName: license.customerName,
      brandName: license.brandName,
      address: license.address || {
        address: "",
        cityId: 0,
        city: "",
        townId: 0,
        town: "",
        countryId: "",
        country: ""
      },
      phone: license.phone,
      email: license.email,
      chainId: license.chainId,
      resellerId: license.resellerId,
      persons: license.persons || [],
      person: license.person,
      block: license.block,
      blockMessage: license.blockMessage,
      isOpen: license.isOpen,
      active: license.active,
      saasItems: license.saasItems || [],
      licenseItems: license.licenseItems || [],
      licenseId: license.licenseId,
      lastOnline: license.lastOnline,
      lastIp: license.lastIp,
      lastVersion: license.lastVersion,
      assetCode: license.assetCode,
      hasRenty: license.hasRenty,
      hasLicense: license.hasLicense,
      haveContract, // Dinamik olarak hesaplanan değer
      hasBoss: license.hasBoss,
      hasEftPos: license.hasEftPos,
      type: license.type,
      currentVersion: license.currentVersion,
      orwiStore: license.orwiStore || { id: "", name: "", cloudId: "" },
      SearchItem: license.SearchItem,
      companyType: license.companyType,
      kitchenType: license.kitchenType,
      category: license.category
    };
  }
}
