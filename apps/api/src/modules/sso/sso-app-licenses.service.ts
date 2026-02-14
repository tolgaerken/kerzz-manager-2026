import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoAppLicence, SsoAppLicenceDocument } from "./schemas";

export interface CreateAppLicenseDto {
  app_id: string;
  user_id: string;
  user_name?: string;
  app_name?: string;
  licance_id?: string;
  brand?: string;
  roles?: string[];
  license_type?: string;
  start_date?: Date;
  end_date?: Date;
  features?: string[];
  SelectedTagValues?: string[];
}

export interface UpdateAppLicenseDto {
  user_name?: string;
  app_name?: string;
  licance_id?: string;
  brand?: string;
  roles?: string[];
  license_type?: string;
  start_date?: Date;
  end_date?: Date;
  features?: string[];
  SelectedTagValues?: string[];
  is_active?: boolean;
}

@Injectable()
export class SsoAppLicensesService {
  private readonly logger = new Logger(SsoAppLicensesService.name);

  constructor(
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly ssoAppLicenceModel: Model<SsoAppLicenceDocument>
  ) {}

  /**
   * Get all app licenses
   */
  async getAppLicenses(): Promise<SsoAppLicence[]> {
    return this.ssoAppLicenceModel.find({ is_active: { $ne: false } }).lean().exec();
  }

  /**
   * Get app licenses by user ID
   */
  async getAppLicensesByUser(userId: string): Promise<SsoAppLicence[]> {
    return this.ssoAppLicenceModel
      .find({ user_id: userId, is_active: { $ne: false } })
      .lean()
      .exec();
  }

  /**
   * Get app licenses by app ID
   */
  async getAppLicensesByApp(appId: string): Promise<SsoAppLicence[]> {
    return this.ssoAppLicenceModel
      .find({ app_id: appId, is_active: { $ne: false } })
      .lean()
      .exec();
  }

  /**
   * Get app license by ID
   */
  async getAppLicenseById(licenseId: string): Promise<SsoAppLicence | null> {
    return this.ssoAppLicenceModel.findOne({ id: licenseId }).lean().exec();
  }

  /**
   * Get app license by app and user
   */
  async getAppLicenseByAppAndUser(appId: string, userId: string): Promise<SsoAppLicence | null> {
    return this.ssoAppLicenceModel
      .findOne({ app_id: appId, user_id: userId, is_active: { $ne: false } })
      .lean()
      .exec();
  }

  /**
   * Create a new app license
   */
  async createAppLicense(dto: CreateAppLicenseDto): Promise<SsoAppLicence> {
    // Check if license already exists for this app-user combination
    const existing = await this.getAppLicenseByAppAndUser(dto.app_id, dto.user_id);

    if (existing) {
      // Reactivate and update existing license
      return this.updateAppLicense(existing.id!, {
        ...dto,
        is_active: true
      });
    }

    const license = new this.ssoAppLicenceModel({
      id: uuidv4(),
      app_id: dto.app_id,
      user_id: dto.user_id,
      user_name: dto.user_name,
      app_name: dto.app_name,
      licance_id: dto.licance_id,
      brand: dto.brand,
      roles: dto.roles || [],
      license_type: dto.license_type,
      start_date: dto.start_date,
      end_date: dto.end_date,
      features: dto.features || [],
      SelectedTagValues: dto.SelectedTagValues || [],
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await license.save();
    return license.toObject();
  }

  /**
   * Update an app license
   */
  async updateAppLicense(licenseId: string, dto: UpdateAppLicenseDto): Promise<SsoAppLicence> {
    const license = await this.ssoAppLicenceModel.findOne({ id: licenseId }).exec();

    if (!license) {
      throw new NotFoundException("Uygulama lisansı bulunamadı");
    }

    if (dto.user_name !== undefined) license.user_name = dto.user_name;
    if (dto.app_name !== undefined) license.app_name = dto.app_name;
    if (dto.licance_id !== undefined) license.licance_id = dto.licance_id;
    if (dto.brand !== undefined) license.brand = dto.brand;
    if (dto.roles !== undefined) license.roles = dto.roles;
    if (dto.license_type !== undefined) license.license_type = dto.license_type;
    if (dto.start_date !== undefined) license.start_date = dto.start_date;
    if (dto.end_date !== undefined) license.end_date = dto.end_date;
    if (dto.features !== undefined) license.features = dto.features;
    if (dto.SelectedTagValues !== undefined) license.SelectedTagValues = dto.SelectedTagValues;
    if (dto.is_active !== undefined) license.is_active = dto.is_active;
    license.updatedAt = new Date();

    await license.save();
    return license.toObject();
  }

  /**
   * Delete an app license (soft delete)
   */
  async deleteAppLicense(licenseId: string): Promise<void> {
    const result = await this.ssoAppLicenceModel.updateOne(
      { id: licenseId },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException("Uygulama lisansı bulunamadı");
    }
  }

  /**
   * Update user roles in app license
   */
  async updateUserRoles(appId: string, userId: string, roles: string[]): Promise<SsoAppLicence> {
    let license = await this.getAppLicenseByAppAndUser(appId, userId);

    if (!license) {
      // Create new license with roles
      return this.createAppLicense({
        app_id: appId,
        user_id: userId,
        roles
      });
    }

    return this.updateAppLicense(license.id!, { roles });
  }
}
