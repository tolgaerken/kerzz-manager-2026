import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
   * is_active filtresi: alan yoksa veya true ise dahil et, sadece false ise hariç tut
   */
  private getActiveFilter(): Record<string, unknown> {
    return {
      $or: [
        { is_active: { $exists: false } },
        { is_active: true },
        { is_active: null }
      ]
    };
  }

  /**
   * .lean() Mongoose default'larını uygulamaz; is_active alanı olmayan eski kayıtlarda
   * undefined döner. Bu metod is_active'i boolean'a normalize eder (undefined/null → true).
   */
  private normalizeIsActive(doc: SsoAppLicence): SsoAppLicence {
    return { ...doc, is_active: doc.is_active !== false };
  }

  private normalizeIsActiveList(docs: SsoAppLicence[]): SsoAppLicence[] {
    return docs.map((doc) => this.normalizeIsActive(doc));
  }

  /**
   * Get all app licenses
   * is_active alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAppLicenses(): Promise<SsoAppLicence[]> {
    const docs = await this.ssoAppLicenceModel.find(this.getActiveFilter()).lean().exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get app licenses by user ID
   * is_active alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAppLicensesByUser(userId: string): Promise<SsoAppLicence[]> {
    const docs = await this.ssoAppLicenceModel
      .find({ user_id: userId, ...this.getActiveFilter() })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get app licenses by app ID
   * is_active alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAppLicensesByApp(appId: string): Promise<SsoAppLicence[]> {
    const docs = await this.ssoAppLicenceModel
      .find({ app_id: appId, ...this.getActiveFilter() })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get app license by ID
   */
  async getAppLicenseById(licenseId: string): Promise<SsoAppLicence | null> {
    const doc = await this.ssoAppLicenceModel.findOne({ id: licenseId }).lean().exec();
    return doc ? this.normalizeIsActive(doc) : null;
  }

  /**
   * Get app license by app and user
   * is_active alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAppLicenseByAppAndUser(appId: string, userId: string): Promise<SsoAppLicence | null> {
    const doc = await this.ssoAppLicenceModel
      .findOne({ app_id: appId, user_id: userId, ...this.getActiveFilter() })
      .lean()
      .exec();
    return doc ? this.normalizeIsActive(doc) : null;
  }

  /**
   * Find existing license matching the unique compound index (user_id + licance_id + app_id)
   */
  private async findExistingLicense(
    appId: string,
    userId: string,
    licanceId?: string
  ): Promise<SsoAppLicence | null> {
    if (licanceId) {
      // Exact match on all three unique index fields
      return this.ssoAppLicenceModel
        .findOne({ app_id: appId, user_id: userId, licance_id: licanceId })
        .lean()
        .exec();
    }
    // Fallback: match by app_id + user_id only (when licance_id not provided)
    return this.getAppLicenseByAppAndUser(appId, userId);
  }

  /**
   * Create a new app license
   */
  async createAppLicense(dto: CreateAppLicenseDto): Promise<SsoAppLicence> {
    // Check with all unique index fields to avoid E11000 duplicate key errors
    const existing = await this.findExistingLicense(dto.app_id, dto.user_id, dto.licance_id);

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

    try {
      await license.save();
    } catch (error: unknown) {
      if (error instanceof Error && "code" in error && (error as { code: number }).code === 11000) {
        throw new ConflictException(
          "Bu kullanıcı-lisans-uygulama kombinasyonu zaten mevcut"
        );
      }
      throw error;
    }
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
