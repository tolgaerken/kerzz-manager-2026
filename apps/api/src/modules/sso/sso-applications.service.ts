import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoApplication, SsoApplicationDocument } from "./schemas";

export interface CreateApplicationDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateApplicationDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

@Injectable()
export class SsoApplicationsService {
  private readonly logger = new Logger(SsoApplicationsService.name);

  constructor(
    @InjectModel(SsoApplication.name, SSO_DB_CONNECTION)
    private readonly ssoApplicationModel: Model<SsoApplicationDocument>
  ) {}

  /**
   * Get all applications
   */
  async getApplications(): Promise<SsoApplication[]> {
    return this.ssoApplicationModel.find({ isActive: true }).sort({ name: 1 }).lean().exec();
  }

  /**
   * Get all applications including inactive
   */
  async getAllApplications(): Promise<SsoApplication[]> {
    return this.ssoApplicationModel.find().sort({ name: 1 }).lean().exec();
  }

  /**
   * Get an application by ID
   */
  async getApplicationById(applicationId: string): Promise<SsoApplication | null> {
    return this.ssoApplicationModel.findOne({ id: applicationId }).lean().exec();
  }

  /**
   * Create a new application
   */
  async createApplication(dto: CreateApplicationDto): Promise<SsoApplication> {
    // Check if application name already exists
    const existing = await this.ssoApplicationModel.findOne({ name: dto.name }).lean().exec();

    if (existing) {
      throw new ConflictException("Bu isimde bir uygulama zaten mevcut");
    }

    const application = new this.ssoApplicationModel({
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await application.save();
    return application.toObject();
  }

  /**
   * Update an application
   */
  async updateApplication(
    applicationId: string,
    dto: UpdateApplicationDto
  ): Promise<SsoApplication> {
    const application = await this.ssoApplicationModel.findOne({ id: applicationId }).exec();

    if (!application) {
      throw new NotFoundException("Uygulama bulunamadı");
    }

    if (dto.name !== undefined) {
      // Check if new name conflicts with existing
      if (dto.name !== application.name) {
        const existing = await this.ssoApplicationModel.findOne({ name: dto.name }).lean().exec();
        if (existing) {
          throw new ConflictException("Bu isimde bir uygulama zaten mevcut");
        }
      }
      application.name = dto.name;
    }
    if (dto.description !== undefined) application.description = dto.description;
    if (dto.isActive !== undefined) application.isActive = dto.isActive;
    application.updatedAt = new Date();

    await application.save();
    return application.toObject();
  }

  /**
   * Delete an application (soft delete)
   */
  async deleteApplication(applicationId: string): Promise<void> {
    const result = await this.ssoApplicationModel.updateOne(
      { id: applicationId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException("Uygulama bulunamadı");
    }
  }

  /**
   * Hard delete an application
   */
  async hardDeleteApplication(applicationId: string): Promise<void> {
    const result = await this.ssoApplicationModel.deleteOne({ id: applicationId });

    if (result.deletedCount === 0) {
      throw new NotFoundException("Uygulama bulunamadı");
    }
  }
}
