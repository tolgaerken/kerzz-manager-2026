import { Injectable, NotFoundException, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { EftPosModel, EftPosModelDocument } from "./schemas/eft-pos-model.schema";
import { EftPosModelQueryDto } from "./dto/eft-pos-model-query.dto";
import { EftPosModelResponseDto, EftPosModelsListResponseDto } from "./dto/eft-pos-model-response.dto";
import { CreateEftPosModelDto } from "./dto/create-eft-pos-model.dto";
import { UpdateEftPosModelDto } from "./dto/update-eft-pos-model.dto";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

// Seed data
const SEED_DATA: CreateEftPosModelDto[] = [
  { id: "ingenico-ide", name: "INGENICO - IDE", brand: "INGENICO", sortOrder: 1, active: true },
  { id: "ingenico-iwe", name: "INGENICO - IWE", brand: "INGENICO", sortOrder: 2, active: true },
  { id: "pavo-un20", name: "PAVO - UN20", brand: "PAVO", sortOrder: 3, active: true },
  { id: "pavo-n86", name: "PAVO - N86", brand: "PAVO", sortOrder: 4, active: true },
  { id: "vera", name: "VERA", brand: "VERA", sortOrder: 5, active: true },
  { id: "vera-plus", name: "VERA-PLUS", brand: "VERA", sortOrder: 6, active: true },
  { id: "hugin", name: "HUGIN", brand: "HUGIN", sortOrder: 7, active: true }
];

@Injectable()
export class EftPosModelsService implements OnModuleInit {
  constructor(
    @InjectModel(EftPosModel.name, CONTRACT_DB_CONNECTION)
    private eftPosModelModel: Model<EftPosModelDocument>
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  private async seedData() {
    const count = await this.eftPosModelModel.countDocuments().exec();
    if (count === 0) {
      await this.eftPosModelModel.insertMany(SEED_DATA);
      console.log("EftPosModels seed data eklendi");
    }
  }

  async findAll(query: EftPosModelQueryDto): Promise<EftPosModelsListResponseDto> {
    const { search, brand, active, sortField = "sortOrder", sortOrder = "asc" } = query;

    // Build filter query
    const filter: Record<string, any> = {};

    if (active !== undefined) {
      filter.active = active;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    // Build sort
    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.eftPosModelModel.find(filter).sort(sort).lean().exec(),
      this.eftPosModelModel.countDocuments(filter).exec()
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      total
    };
  }

  async findOne(id: string): Promise<EftPosModelResponseDto> {
    const model = await this.eftPosModelModel.findOne({ id }).lean().exec();
    if (!model) {
      throw new NotFoundException(`EftPos modeli bulunamadı: ${id}`);
    }
    return this.mapToResponseDto(model);
  }

  async create(createDto: CreateEftPosModelDto): Promise<EftPosModelResponseDto> {
    const modelData = {
      ...createDto,
      editDate: new Date(),
      active: createDto.active ?? true,
      sortOrder: createDto.sortOrder ?? 0
    };

    const model = new this.eftPosModelModel(modelData);
    const saved = await model.save();
    return this.mapToResponseDto(saved.toObject());
  }

  async update(id: string, updateDto: UpdateEftPosModelDto): Promise<EftPosModelResponseDto> {
    const updateData = {
      ...updateDto,
      editDate: new Date()
    };

    const model = await this.eftPosModelModel
      .findOneAndUpdate({ id }, updateData, { new: true })
      .lean()
      .exec();

    if (!model) {
      throw new NotFoundException(`EftPos modeli bulunamadı: ${id}`);
    }

    return this.mapToResponseDto(model);
  }

  async remove(id: string): Promise<void> {
    const result = await this.eftPosModelModel.findOneAndDelete({ id }).exec();
    if (!result) {
      throw new NotFoundException(`EftPos modeli bulunamadı: ${id}`);
    }
  }

  private mapToResponseDto(model: EftPosModel & { createdAt?: Date; updatedAt?: Date }): EftPosModelResponseDto {
    return {
      _id: model._id.toString(),
      id: model.id,
      name: model.name,
      brand: model.brand || "",
      active: model.active ?? true,
      sortOrder: model.sortOrder || 0,
      editDate: model.editDate,
      editUser: model.editUser,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    };
  }
}
