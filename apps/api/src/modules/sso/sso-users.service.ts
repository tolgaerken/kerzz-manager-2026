import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import {
  SsoUser,
  SsoUserDocument,
  SsoUserApp,
  SsoUserAppDocument,
  SsoAppLicence,
  SsoAppLicenceDocument
} from "./schemas";

export interface AppUserDto {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  assignedDate?: Date;
}

export interface AssignUserDto {
  userId: string;
  userName: string;
  roles?: string[];
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface AddUserToAppDto {
  name: string;
  email?: string;
  phone?: string;
  appId: string;
}

export interface AddUserToAppResult {
  user: SsoUser;
  userApp: SsoUserApp;
  isNewUser: boolean;
}

@Injectable()
export class SsoUsersService {
  private readonly logger = new Logger(SsoUsersService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly ssoUserModel: Model<SsoUserDocument>,
    @InjectModel(SsoUserApp.name, SSO_DB_CONNECTION)
    private readonly ssoUserAppModel: Model<SsoUserAppDocument>,
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly ssoAppLicenceModel: Model<SsoAppLicenceDocument>
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
  }

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<SsoUser | null> {
    return this.ssoUserModel.findOne({ id: userId }).lean().exec();
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<SsoUser | null> {
    return this.ssoUserModel.findOne({ email }).lean().exec();
  }

  /**
   * Update a user's details
   */
  async updateUser(userId: string, dto: UpdateUserDto): Promise<SsoUser> {
    const user = await this.ssoUserModel.findOne({ id: userId }).exec();
    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı");
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    user.updatedAt = new Date();

    await user.save();
    this.logger.log(`User updated: ${userId} - ${JSON.stringify(dto)}`);

    return user.toObject();
  }

  /**
   * Get all users assigned to this application
   */
  async getAppUsers(appId?: string): Promise<AppUserDto[]> {
    const effectiveAppId = appId && appId.length > 0 ? appId : this.appId;

    const userApps = await this.ssoUserAppModel
      // user-app kaydında ilgili app_id + devre dışı olmayan atamalar
      // Bazı eski kayıtlarda isActive alanı olmayabiliyor; onları aktif kabul et
      .find({ app_id: effectiveAppId, isActive: { $ne: false } })
      .sort({ user_name: 1 })
      .lean()
      .exec();

    if (userApps.length === 0) {
      return [];
    }

    const userIds = userApps.map((ua) => ua.user_id);
    const users = await this.ssoUserModel.find({ id: { $in: userIds } }).lean().exec();
    const userMap = new Map(users.map((u) => [u.id, u]));

    const result: AppUserDto[] = [];
    for (const ua of userApps) {
      const user = userMap.get(ua.user_id);
      if (user) {
        result.push({
          id: ua.user_id,
          name: ua.user_name || user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          assignedDate: ua.assignedDate
        });
      }
    }
    return result;
  }

  /**
   * Get all users from all applications
   */
  async getAllUsers(): Promise<AppUserDto[]> {
    // Tüm user-app kayıtlarını al
    const userApps = await this.ssoUserAppModel
      .find({ isActive: { $ne: false } })
      .sort({ user_name: 1 })
      .lean()
      .exec();

    if (userApps.length === 0) {
      return [];
    }

    // Benzersiz kullanıcı ID'lerini al
    const userIds = [...new Set(userApps.map((ua) => ua.user_id))];
    const users = await this.ssoUserModel.find({ id: { $in: userIds } }).lean().exec();
    const userMap = new Map(users.map((u) => [u.id, u]));

    // Benzersiz kullanıcıları döndür (aynı kullanıcı birden fazla uygulamada olabilir)
    const seenUserIds = new Set<string>();
    const result: AppUserDto[] = [];

    for (const ua of userApps) {
      if (seenUserIds.has(ua.user_id)) continue;
      seenUserIds.add(ua.user_id);

      const user = userMap.get(ua.user_id);
      if (user) {
        result.push({
          id: ua.user_id,
          name: ua.user_name || user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive,
          assignedDate: ua.assignedDate
        });
      }
    }
    return result;
  }

  /**
   * Search users in SSO database
   */
  async searchUsers(query: string, limit = 20): Promise<SsoUser[]> {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchRegex = new RegExp(escapedQuery, "i");

    this.logger.debug(`searchUsers called - query: "${query}", escaped: "${escapedQuery}", limit: ${limit}`);

    const results = await this.ssoUserModel
      .find({
        $or: [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }]
      })
      .limit(limit)
      .lean()
      .exec();

    this.logger.debug(`searchUsers results: ${results.length} users found`);
    if (results.length > 0) {
      this.logger.debug(`First result: ${JSON.stringify({ id: results[0].id, name: results[0].name, email: results[0].email, phone: results[0].phone })}`);
    }

    // Sonuç yoksa, koleksiyonda toplam kayıt sayısını logla
    if (results.length === 0) {
      const totalCount = await this.ssoUserModel.countDocuments();
      this.logger.debug(`No results found. Total users in collection: ${totalCount}`);

      // İlk 3 kaydı göster
      const sampleUsers = await this.ssoUserModel.find().limit(3).lean().exec();
      this.logger.debug(`Sample users: ${JSON.stringify(sampleUsers.map((u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone })))}`);
    }

    return results;
  }

  /**
   * Assign a user to this application
   */
  async assignUserToApp(dto: AssignUserDto): Promise<SsoUserApp> {
    const { userId, userName, roles } = dto;

    // Check if user exists
    const user = await this.ssoUserModel.findOne({ id: userId }).lean().exec();
    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı");
    }

    // Check if already assigned
    const existing = await this.ssoUserAppModel
      .findOne({ app_id: this.appId, user_id: userId })
      .exec();

    if (existing) {
      // Update existing assignment
      existing.isActive = true;
      existing.user_name = userName;
      existing.updatedAt = new Date();
      await existing.save();
      return existing.toObject();
    }

    // Create new assignment
    const userApp = new this.ssoUserAppModel({
      id: `${this.appId}-${userId}`,
      app_id: this.appId,
      user_id: userId,
      user_name: userName,
      isActive: true,
      assignedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await userApp.save();

    // Also create app-licence if roles provided
    if (roles && roles.length > 0) {
      await this.updateUserRoles(userId, roles);
    }

    return userApp.toObject();
  }

  /**
   * Remove a user from this application
   */
  async removeUserFromApp(userId: string): Promise<void> {
    await this.ssoUserAppModel.updateOne(
      { app_id: this.appId, user_id: userId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    // Also deactivate licence
    await this.ssoAppLicenceModel.updateOne(
      { app_id: this.appId, user_id: userId },
      { $set: { is_active: false, updatedAt: new Date() } }
    );
  }

  /**
   * Update user's roles for this application
   */
  async updateUserRoles(userId: string, roleIds: string[]): Promise<SsoAppLicence> {
    const user = await this.ssoUserModel.findOne({ id: userId }).lean().exec();
    if (!user) {
      throw new NotFoundException("Kullanıcı bulunamadı");
    }

    const existing = await this.ssoAppLicenceModel
      .findOne({ app_id: this.appId, user_id: userId })
      .exec();

    if (existing) {
      existing.roles = roleIds;
      existing.is_active = true;
      existing.updatedAt = new Date();
      await existing.save();
      return existing.toObject();
    }

    const licence = new this.ssoAppLicenceModel({
      id: `${this.appId}-${userId}-licence`,
      app_id: this.appId,
      user_id: userId,
      user_name: user.name,
      roles: roleIds,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await licence.save();
    return licence.toObject();
  }

  /**
   * Get user's roles for this application
   */
  async getUserRoles(userId: string): Promise<string[]> {
    const licence = await this.ssoAppLicenceModel
      .findOne({ app_id: this.appId, user_id: userId })
      .lean()
      .exec();

    return licence?.roles || [];
  }

  /**
   * Check if user is assigned to this application
   */
  async isUserAssigned(userId: string): Promise<boolean> {
    const userApp = await this.ssoUserAppModel
      .findOne({ app_id: this.appId, user_id: userId, isActive: true })
      .lean()
      .exec();

    return !!userApp;
  }

  /**
   * Add a user to an application
   * If user exists (by email or phone), use existing user
   * If user doesn't exist, create new user first
   * Then add user-app assignment
   */
  async addUserToApp(dto: AddUserToAppDto): Promise<AddUserToAppResult> {
    const { name, email, phone, appId } = dto;

    // At least email or phone must be provided
    if (!email && !phone) {
      throw new BadRequestException("E-posta veya telefon numarasından en az biri gereklidir");
    }

    // Build search conditions for existing user
    const searchConditions: Array<{ email?: string; phone?: string }> = [];
    if (email) {
      searchConditions.push({ email });
    }
    if (phone) {
      searchConditions.push({ phone });
    }

    // Check if user already exists
    let user = await this.ssoUserModel
      .findOne({ $or: searchConditions })
      .lean()
      .exec();

    let isNewUser = false;

    if (!user) {
      // Create new user
      const newUserId = uuidv4();
      const newUser = new this.ssoUserModel({
        id: newUserId,
        name,
        email: email || "",
        phone: phone || "",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newUser.save();
      user = newUser.toObject();
      isNewUser = true;
      this.logger.log(`New user created: ${newUserId} - ${name}`);
    }

    // Check if user-app assignment already exists
    const existingUserApp = await this.ssoUserAppModel
      .findOne({ app_id: appId, user_id: user.id })
      .exec();

    let userApp: SsoUserApp;

    if (existingUserApp) {
      // Reactivate existing assignment
      existingUserApp.isActive = true;
      existingUserApp.user_name = user.name;
      existingUserApp.updatedAt = new Date();
      await existingUserApp.save();
      userApp = existingUserApp.toObject();
      this.logger.log(`User-app assignment reactivated: ${appId} - ${user.id}`);
    } else {
      // Create new user-app assignment
      const newUserApp = new this.ssoUserAppModel({
        id: `${appId}-${user.id}`,
        app_id: appId,
        user_id: user.id,
        user_name: user.name,
        isActive: true,
        assignedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newUserApp.save();
      userApp = newUserApp.toObject();
      this.logger.log(`New user-app assignment created: ${appId} - ${user.id}`);
    }

    return {
      user,
      userApp,
      isNewUser
    };
  }
}
