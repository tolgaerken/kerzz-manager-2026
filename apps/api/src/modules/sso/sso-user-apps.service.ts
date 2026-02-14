import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoUserApp, SsoUserAppDocument } from "./schemas";

export interface CreateUserAppDto {
  app_id: string;
  user_id: string;
  user_name: string;
}

export interface UpdateUserAppDto {
  user_name?: string;
  isActive?: boolean;
}

@Injectable()
export class SsoUserAppsService {
  private readonly logger = new Logger(SsoUserAppsService.name);

  constructor(
    @InjectModel(SsoUserApp.name, SSO_DB_CONNECTION)
    private readonly ssoUserAppModel: Model<SsoUserAppDocument>
  ) {}

  /**
   * Get all user-app assignments
   */
  async getUserApps(): Promise<SsoUserApp[]> {
    return this.ssoUserAppModel.find({ isActive: { $ne: false } }).lean().exec();
  }

  /**
   * Get user-app assignments by user ID
   */
  async getUserAppsByUser(userId: string): Promise<SsoUserApp[]> {
    return this.ssoUserAppModel.find({ user_id: userId, isActive: { $ne: false } }).lean().exec();
  }

  /**
   * Get user-app assignments by app ID
   */
  async getUserAppsByApp(appId: string): Promise<SsoUserApp[]> {
    return this.ssoUserAppModel.find({ app_id: appId, isActive: { $ne: false } }).lean().exec();
  }

  /**
   * Get user-app assignment by ID
   */
  async getUserAppById(userAppId: string): Promise<SsoUserApp | null> {
    return this.ssoUserAppModel.findOne({ id: userAppId }).lean().exec();
  }

  /**
   * Get user-app assignment by app and user
   */
  async getUserAppByAppAndUser(appId: string, userId: string): Promise<SsoUserApp | null> {
    return this.ssoUserAppModel.findOne({ app_id: appId, user_id: userId }).lean().exec();
  }

  /**
   * Create a new user-app assignment
   */
  async createUserApp(dto: CreateUserAppDto): Promise<SsoUserApp> {
    // Check if assignment already exists
    const existing = await this.getUserAppByAppAndUser(dto.app_id, dto.user_id);

    if (existing) {
      // Reactivate existing assignment
      return this.updateUserApp(existing.id!, {
        user_name: dto.user_name,
        isActive: true
      });
    }

    const userApp = new this.ssoUserAppModel({
      id: `${dto.app_id}-${dto.user_id}`,
      app_id: dto.app_id,
      user_id: dto.user_id,
      user_name: dto.user_name,
      isActive: true,
      assignedDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await userApp.save();
    return userApp.toObject();
  }

  /**
   * Update a user-app assignment
   */
  async updateUserApp(userAppId: string, dto: UpdateUserAppDto): Promise<SsoUserApp> {
    const userApp = await this.ssoUserAppModel.findOne({ id: userAppId }).exec();

    if (!userApp) {
      throw new NotFoundException("Kullanıcı-uygulama ataması bulunamadı");
    }

    if (dto.user_name !== undefined) userApp.user_name = dto.user_name;
    if (dto.isActive !== undefined) userApp.isActive = dto.isActive;
    userApp.updatedAt = new Date();

    await userApp.save();
    return userApp.toObject();
  }

  /**
   * Delete a user-app assignment (soft delete)
   */
  async deleteUserApp(userAppId: string): Promise<void> {
    const result = await this.ssoUserAppModel.updateOne(
      { id: userAppId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      throw new NotFoundException("Kullanıcı-uygulama ataması bulunamadı");
    }
  }

  /**
   * Remove user from app by app and user IDs
   */
  async removeUserFromApp(appId: string, userId: string): Promise<void> {
    const userApp = await this.getUserAppByAppAndUser(appId, userId);

    if (userApp && userApp.id) {
      await this.deleteUserApp(userApp.id);
    }
  }

  /**
   * Check if user is assigned to app
   */
  async isUserAssignedToApp(appId: string, userId: string): Promise<boolean> {
    const userApp = await this.ssoUserAppModel
      .findOne({ app_id: appId, user_id: userId, isActive: true })
      .lean()
      .exec();

    return !!userApp;
  }
}
