import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import {
  SsoAppLicence,
  SsoAppLicenceDocument,
  SsoUser,
  SsoUserDocument
} from "../sso/schemas";
import {
  BossLicenseUserDto,
  BranchDto,
  CreateBossLicenseDto,
  UpdateBossLicenseDto,
  UpdateBranchesDto,
  BlockUserDto,
  UpsertUserDto
} from "./dto";

/** Kerzz Boss app_id */
const KERZZ_BOSS_APP_ID = "2a17-a038";

@Injectable()
export class BossUsersService {
  private readonly logger = new Logger(BossUsersService.name);
  private readonly ssoServiceUrl: string;

  private getUserMail(user: (SsoUser & { mail?: string }) | null | undefined): string | undefined {
    if (!user) return undefined;
    return user.email || user.mail;
  }

  constructor(
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly appLicenceModel: Model<SsoAppLicenceDocument>,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly userModel: Model<SsoUserDocument>,
    private readonly configService: ConfigService
  ) {
    this.ssoServiceUrl =
      this.configService.get<string>("SSO_SERVICE_URL") ||
      "https://sso-service.kerzz.com:4500";
  }

  /**
   * Tüm Kerzz Boss lisanslarını kullanıcı bilgileriyle birlikte getir
   */
  async getAllLicenses(): Promise<BossLicenseUserDto[]> {
    // Boss app lisanslarını getir
    const licenses = await this.appLicenceModel
      .find({ app_id: KERZZ_BOSS_APP_ID, is_active: { $ne: false } })
      .lean()
      .exec();

    if (licenses.length === 0) {
      return [];
    }

    // Kullanıcı ID'lerini topla
    const userIds = [...new Set(licenses.map((l) => l.user_id))];

    // Kullanıcıları batch olarak getir
    const users = await this.userModel
      .find({ id: { $in: userIds } })
      .lean()
      .exec();

    // Kullanıcı map'i oluştur
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Lisansları kullanıcı bilgileriyle zenginleştir
    return licenses.map((license) => {
      const user = userMap.get(license.user_id);
      return {
        id: license.id || "",
        app_id: license.app_id,
        user_id: license.user_id,
        user_name: license.user_name,
        licance_id: license.licance_id,
        brand: license.brand,
        roles: license.roles || [],
        branchCodes: (license as any).branchCodes || [],
        statusText: (license as any).statusText,
        start_date: license.start_date,
        end_date: license.end_date,
        is_active: license.is_active,
        customerId: user?.customerId,
        mail: this.getUserMail(user),
        phone: user?.phone,
        lastLoginDate: user?.lastLoginDate,
        createdAt: license.createdAt,
        updatedAt: license.updatedAt
      };
    });
  }

  /**
   * Belirli bir kullanıcının Boss lisanslarını getir
   */
  async getLicensesByUser(userId: string): Promise<BossLicenseUserDto[]> {
    const licenses = await this.appLicenceModel
      .find({
        app_id: KERZZ_BOSS_APP_ID,
        user_id: userId,
        is_active: { $ne: false }
      })
      .lean()
      .exec();

    const user = await this.userModel.findOne({ id: userId }).lean().exec();

    return licenses.map((license) => ({
      id: license.id || "",
      app_id: license.app_id,
      user_id: license.user_id,
      user_name: license.user_name,
      licance_id: license.licance_id,
      brand: license.brand,
      roles: license.roles || [],
      branchCodes: (license as any).branchCodes || [],
      statusText: (license as any).statusText,
      start_date: license.start_date,
      end_date: license.end_date,
      is_active: license.is_active,
      customerId: user?.customerId,
      mail: this.getUserMail(user),
      phone: user?.phone,
      lastLoginDate: user?.lastLoginDate,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt
    }));
  }

  /**
   * Lisans oluştur veya güncelle
   */
  async upsertLicense(dto: CreateBossLicenseDto): Promise<BossLicenseUserDto> {
    let license: SsoAppLicenceDocument | null = null;

    if (dto.id) {
      license = await this.appLicenceModel.findOne({ id: dto.id }).exec();
    }

    if (license) {
      // Güncelle
      if (dto.user_name !== undefined) license.user_name = dto.user_name;
      if (dto.licance_id !== undefined) license.licance_id = dto.licance_id;
      if (dto.brand !== undefined) license.brand = dto.brand;
      if (dto.roles !== undefined) license.roles = dto.roles;
      if (dto.branchCodes !== undefined)
        (license as any).branchCodes = dto.branchCodes;
      license.updatedAt = new Date();
      await license.save();
    } else {
      // Oluştur
      license = new this.appLicenceModel({
        id: uuidv4(),
        app_id: KERZZ_BOSS_APP_ID,
        user_id: dto.user_id,
        user_name: dto.user_name,
        app_name: "Kerzz Boss",
        licance_id: dto.licance_id,
        brand: dto.brand,
        roles: dto.roles || [],
        branchCodes: dto.branchCodes || [],
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await license.save();
    }

    const user = await this.userModel
      .findOne({ id: dto.user_id })
      .lean()
      .exec();

    return {
      id: license.id || "",
      app_id: license.app_id,
      user_id: license.user_id,
      user_name: license.user_name,
      licance_id: license.licance_id,
      brand: license.brand,
      roles: license.roles || [],
      branchCodes: (license as any).branchCodes || [],
      statusText: (license as any).statusText,
      start_date: license.start_date,
      end_date: license.end_date,
      is_active: license.is_active,
      customerId: user?.customerId,
      mail: this.getUserMail(user),
      phone: user?.phone,
      lastLoginDate: user?.lastLoginDate,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt
    };
  }

  /**
   * Lisans güncelle
   */
  async updateLicense(
    licenseId: string,
    dto: UpdateBossLicenseDto
  ): Promise<BossLicenseUserDto> {
    const license = await this.appLicenceModel
      .findOne({ id: licenseId })
      .exec();

    if (!license) {
      throw new NotFoundException("Lisans bulunamadı");
    }

    if (dto.user_name !== undefined) license.user_name = dto.user_name;
    if (dto.licance_id !== undefined) license.licance_id = dto.licance_id;
    if (dto.brand !== undefined) license.brand = dto.brand;
    if (dto.roles !== undefined) license.roles = dto.roles;
    if (dto.branchCodes !== undefined)
      (license as any).branchCodes = dto.branchCodes;
    if (dto.statusText !== undefined)
      (license as any).statusText = dto.statusText;
    if (dto.is_active !== undefined) license.is_active = dto.is_active;
    license.updatedAt = new Date();

    await license.save();

    const user = await this.userModel
      .findOne({ id: license.user_id })
      .lean()
      .exec();

    return {
      id: license.id || "",
      app_id: license.app_id,
      user_id: license.user_id,
      user_name: license.user_name,
      licance_id: license.licance_id,
      brand: license.brand,
      roles: license.roles || [],
      branchCodes: (license as any).branchCodes || [],
      statusText: (license as any).statusText,
      start_date: license.start_date,
      end_date: license.end_date,
      is_active: license.is_active,
      customerId: user?.customerId,
      mail: this.getUserMail(user),
      phone: user?.phone,
      lastLoginDate: user?.lastLoginDate,
      createdAt: license.createdAt,
      updatedAt: license.updatedAt
    };
  }

  /**
   * Lisans sil (soft delete)
   */
  async deleteLicense(licenseId: string): Promise<void> {
    const result = await this.appLicenceModel.updateOne(
      { id: licenseId },
      { $set: { is_active: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException("Lisans bulunamadı");
    }
  }

  /**
   * Şube yetkilerini güncelle
   */
  async updateBranches(
    licenseId: string,
    dto: UpdateBranchesDto
  ): Promise<BossLicenseUserDto> {
    return this.updateLicense(licenseId, { branchCodes: dto.branchCodes });
  }

  /**
   * Kullanıcıyı engelle
   */
  async blockUser(licenseId: string, dto: BlockUserDto): Promise<BossLicenseUserDto> {
    const statusText = JSON.stringify({
      type: dto.type || "block",
      message: dto.message,
      paymentLink: dto.paymentLink,
      blockedAt: new Date().toISOString()
    });

    return this.updateLicense(licenseId, { statusText });
  }

  /**
   * Engeli kaldır
   */
  async unblockUser(licenseId: string): Promise<BossLicenseUserDto> {
    return this.updateLicense(licenseId, { statusText: "" });
  }

  /**
   * Şubeleri getir (SSO helper API proxy)
   */
  async getBranches(
    licanceId: string,
    authHeaders?: { userToken?: string; apiKey?: string }
  ): Promise<BranchDto[]> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (authHeaders?.userToken) {
        headers["x-user-token"] = authHeaders.userToken;
      }
      if (authHeaders?.apiKey) {
        headers["x-api-key"] = authHeaders.apiKey;
      }

      const response = await fetch(
        `${this.ssoServiceUrl}/api/helper/getBranchs`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            // SSO helper endpoint'i licance_id bekliyor
            licance_id: licanceId,
            // Geriye dönük/uyumluluk için camelCase de gönder
            licanceId
          })
        }
      );

      if (!response.ok) {
        this.logger.warn(
          `SSO getBranches API error: ${response.status} ${response.statusText} (hasUserToken=${Boolean(authHeaders?.userToken)}, hasApiKey=${Boolean(authHeaders?.apiKey)})`
        );
        return [];
      }

      const data = await response.json();
      return (data || []).map((branch: any) => ({
        id: branch.id || branch._id,
        name: branch.name || branch.branchName,
        isActive: branch.isActive !== false
      }));
    } catch (error) {
      this.logger.error("SSO getBranches API error:", error);
      return [];
    }
  }

  /**
   * Kullanıcı oluştur veya güncelle
   */
  async upsertUser(dto: UpsertUserDto): Promise<SsoUser> {
    let user: SsoUserDocument | null = null;

    if (dto.id) {
      user = await this.userModel.findOne({ id: dto.id }).exec();
    }

    if (!user && dto.email) {
      user = await this.userModel
        .findOne({
          $or: [{ email: dto.email }, { mail: dto.email }]
        })
        .exec();
    }

    if (!user && dto.phone) {
      user = await this.userModel.findOne({ phone: dto.phone }).exec();
    }

    if (user) {
      // Güncelle
      user.name = dto.name;
      user.email = dto.email;
      user.mail = dto.email;
      if (dto.phone) user.phone = dto.phone;
      user.customerId = dto.customerId;
      user.updatedAt = new Date();
      await user.save();
      return user.toObject();
    }

    // Oluştur
    user = new this.userModel({
      id: uuidv4(),
      name: dto.name,
      email: dto.email,
      mail: dto.email,
      phone: dto.phone,
      customerId: dto.customerId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await user.save();
    return user.toObject();
  }

  /**
   * Kullanıcıyı telefon ile ara
   */
  async findUserByPhone(phone: string): Promise<SsoUser | null> {
    return this.userModel.findOne({ phone }).lean().exec();
  }

  /**
   * Kullanıcıyı email ile ara
   */
  async findUserByEmail(email: string): Promise<SsoUser | null> {
    return this.userModel
      .findOne({
        $or: [{ email }, { mail: email }]
      })
      .lean()
      .exec();
  }

  /**
   * Kullanıcıyı ID ile getir
   */
  async getUserById(userId: string): Promise<SsoUser | null> {
    return this.userModel.findOne({ id: userId }).lean().exec();
  }
}
