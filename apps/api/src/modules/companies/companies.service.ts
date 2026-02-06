import { Injectable, Logger, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { GroupCompany, GroupCompanyDocument } from "./schemas/group-company.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { CreateGroupCompanyDto } from "./dto/create-group-company.dto";

@Injectable()
export class CompaniesService implements OnModuleInit {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectModel(GroupCompany.name, CONTRACT_DB_CONNECTION)
    private groupCompanyModel: Model<GroupCompanyDocument>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seed();
  }

  async findAll(): Promise<GroupCompanyDocument[]> {
    return this.groupCompanyModel.find().sort({ name: 1 }).lean().exec();
  }

  async findById(id: string): Promise<GroupCompanyDocument> {
    const company = await this.groupCompanyModel.findOne({ id }).lean().exec();
    if (!company) {
      throw new NotFoundException(`Firma bulunamadı: ${id}`);
    }
    return company;
  }

  async findByIdc(idc: string): Promise<GroupCompanyDocument> {
    const company = await this.groupCompanyModel.findOne({ idc }).lean().exec();
    if (!company) {
      throw new NotFoundException(`Firma bulunamadı: ${idc}`);
    }
    return company;
  }

  async findWithCloudDb(): Promise<GroupCompanyDocument[]> {
    return this.groupCompanyModel
      .find({ cloudDb: { $ne: "" } })
      .lean()
      .exec();
  }

  async create(dto: CreateGroupCompanyDto): Promise<GroupCompanyDocument> {
    const created = new this.groupCompanyModel(dto);
    return created.save();
  }

  private async seed(): Promise<void> {
    const count = await this.groupCompanyModel.countDocuments().exec();
    if (count > 0) {
      this.logger.log(`Firmalar zaten mevcut (${count} kayıt), seed atlanıyor.`);
      return;
    }

    const seedData: CreateGroupCompanyDto[] = [
      {
        id: "VERI",
        idc: "veri",
        name: "VERİ YAZILIM A.Ş.",
        cloudDb: "218",
        licanceId: "349",
        eInvoice: true,
        vatNo: "9240485845",
        noVat: false,
        exemptionReason: "",
        description: "",
      },
      {
        id: "CLOUD",
        idc: "cloud",
        name: "CLOUD LABS A.Ş.",
        cloudDb: "7040",
        licanceId: "",
        eInvoice: true,
        vatNo: "2111178189",
        noVat: false,
        exemptionReason: "",
        description: "",
      },
      {
        id: "ETYA",
        idc: "etya",
        name: "ETYA RESEARCH A.Ş.",
        cloudDb: "6391",
        licanceId: "",
        eInvoice: true,
        vatNo: "",
        noVat: true,
        exemptionReason: "223",
        description:
          "<br>STB Proje Kodu 097920 nolu proje kapsamında KDV ve Gelir Vergisinden istisna olarak düzenlenmiştir",
      },
      {
        id: "BTT",
        idc: "btt",
        name: "BTT TEKNOLOJİ A.Ş.",
        cloudDb: "256",
        licanceId: "",
        eInvoice: true,
        vatNo: "1871283060",
        noVat: false,
        exemptionReason: "",
        description: "",
      },
      {
        id: "MARKAMUTFAGI",
        idc: "markamutfagi",
        name: "MARKA MUTFAĞI A.Ş.",
        cloudDb: "4165",
        licanceId: "",
        eInvoice: true,
        vatNo: "6121332112",
        noVat: false,
        exemptionReason: "",
        description: "",
      },
      {
        id: "KERZZBV",
        idc: "kerzzbv",
        name: "Kerzz B.V.",
        cloudDb: "",
        licanceId: "",
        eInvoice: false,
        vatNo: "",
        noVat: false,
        exemptionReason: "",
        description: "",
      },
    ];

    await this.groupCompanyModel.insertMany(seedData);
    this.logger.log(`${seedData.length} firma seed olarak eklendi.`);
  }
}
