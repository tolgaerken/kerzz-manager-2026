import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  EDocMember,
  EDocMemberDocument,
} from "./schemas/e-doc-member.schema";
import {
  Customer,
  CustomerDocument,
} from "../customers/schemas/customer.schema";
import {
  License,
  LicenseDocument,
} from "../licenses/schemas/license.schema";
import {
  EDocMemberQueryDto,
  CreateEDocMemberDto,
  UpdateEDocMemberDto,
  EDocMemberResponseDto,
  EDocMembersListResponseDto,
} from "./dto";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { MemberBalanceService } from "./services/member-balance.service";

@Injectable()
export class EDocMembersService {
  constructor(
    @InjectModel(EDocMember.name, HELPERS_DB_CONNECTION)
    private eDocMemberModel: Model<EDocMemberDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    @InjectModel(License.name, CONTRACT_DB_CONNECTION)
    private licenseModel: Model<LicenseDocument>,
    private memberBalanceService: MemberBalanceService,
  ) {}

  async findAll(
    query: EDocMemberQueryDto,
  ): Promise<EDocMembersListResponseDto> {
    const filter: Record<string, unknown> = {};

    if (query.internalFirm) {
      filter.internalFirm = query.internalFirm;
    }

    if (query.contractType) {
      filter.contractType = query.contractType;
    }

    if (query.active === "true") {
      filter.active = true;
    } else if (query.active === "false") {
      filter.active = false;
    }

    if (query.search) {
      filter.$or = [
        { erpId: { $regex: query.search, $options: "i" } },
        { desc: { $regex: query.search, $options: "i" } },
        { taxNumber: { $regex: query.search, $options: "i" } },
      ];
    }

    const sortField = query.sortField || "createdAt";
    const sortOrder = query.sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.eDocMemberModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .lean()
        .exec(),
      this.eDocMemberModel.countDocuments(filter).exec(),
    ]);

    // Müşteri isimlerini erpId üzerinden toplu çek
    const erpIds = [
      ...new Set((data as any[]).map((d) => d.erpId).filter(Boolean)),
    ];

    let customerNameMap = new Map<string, string>();
    if (erpIds.length > 0) {
      const customers = await this.customerModel
        .find({ erpId: { $in: erpIds } })
        .select("erpId name companyName")
        .lean()
        .exec();

      customerNameMap = new Map(
        (customers as any[]).map((c) => [
          c.erpId,
          c.companyName || c.name || "",
        ]),
      );
    }

    // Lisans isimlerini toplu çek (licanceId değerleri License.id alanına karşılık gelir)
    const licenseIds = [
      ...new Set((data as any[]).map((d) => d.licanceId).filter(Boolean)),
    ];

    let licenseNameMap = new Map<string, string>();
    if (licenseIds.length > 0) {
      const licenses = await this.licenseModel
        .find({ id: { $in: licenseIds } })
        .select("id brandName")
        .lean()
        .exec();

      licenseNameMap = new Map(
        (licenses as any[]).map((l) => [l.id, l.brandName || ""]),
      );
    }

    // Bakiye bilgilerini hesapla
    const balances = await this.memberBalanceService.calculateBalances(erpIds);

    return {
      data: data.map((doc) => {
        const customerName = customerNameMap.get(doc.erpId) ?? "";
        const licenseName = licenseNameMap.get(doc.licanceId) ?? "";
        const balance = balances.get(doc.erpId);

        return this.mapToResponseDto(doc, customerName, licenseName, balance);
      }),
      total,
    };
  }

  async findOne(id: string): Promise<EDocMemberResponseDto> {
    const member = await this.eDocMemberModel.findOne({ id }).lean().exec();
    if (!member) {
      throw new NotFoundException(`E-Doc member with id ${id} not found`);
    }
    return this.mapToResponseDto(member);
  }

  async create(dto: CreateEDocMemberDto): Promise<EDocMemberResponseDto> {
    const id = this.generateId();
    const now = new Date();

    const member = new this.eDocMemberModel({
      ...dto,
      id,
      active: dto.active ?? true,
      creditPrice: dto.creditPrice ?? 0,
      creditBalance: 0,
      contract: dto.contract ?? false,
      editDate: now,
    });

    const saved = await member.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(
    id: string,
    dto: UpdateEDocMemberDto,
  ): Promise<EDocMemberResponseDto> {
    const updateData: Record<string, unknown> = {
      ...dto,
      editDate: new Date(),
    };

    const updated = await this.eDocMemberModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(`E-Doc member with id ${id} not found`);
    }

    return this.mapToResponseDto(updated);
  }

  async delete(id: string): Promise<void> {
    const result = await this.eDocMemberModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`E-Doc member with id ${id} not found`);
    }
  }

  private mapToResponseDto(
    member: EDocMember,
    customerName = "",
    licenseName = "",
    balance?: {
      creditBalance: number;
      totalCharge: number;
      totalConsumption: number;
      monthlyAverage: number;
    },
  ): EDocMemberResponseDto {
    return {
      _id: member._id.toString(),
      id: member.id,
      erpId: member.erpId || "",
      licanceId: member.licanceId || "",
      internalFirm: member.internalFirm || "",
      active: member.active ?? true,
      syncErp: member.syncErp ?? false,
      syncInbound: member.syncInbound ?? false,
      desc: member.desc || "",
      taxNumber: member.taxNumber || "",
      contractType: member.contractType || "pay-as-you-go",
      creditPrice: member.creditPrice || 0,
      totalPurchasedCredits: member.totalPurchasedCredits || 0,
      creditBalance: balance?.creditBalance ?? member.creditBalance ?? 0,
      contract: member.contract ?? false,
      customerName,
      licenseName,
      totalCharge: balance?.totalCharge ?? 0,
      totalConsumption: balance?.totalConsumption ?? 0,
      monthlyAverage: balance?.monthlyAverage ?? 0,
      editDate: member.editDate,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  private generateId(): string {
    return (
      "edoc_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11)
    );
  }
}
