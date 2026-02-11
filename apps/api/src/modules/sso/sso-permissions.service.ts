import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoPermission, SsoPermissionDocument } from "./schemas";

export interface CreatePermissionDto {
  group: string;
  permission: string;
  description?: string;
  parentId?: string;
}

export interface UpdatePermissionDto {
  group?: string;
  permission?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface PermissionGroup {
  group: string;
  permissions: SsoPermission[];
}

@Injectable()
export class SsoPermissionsService {
  private readonly logger = new Logger(SsoPermissionsService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoPermission.name, SSO_DB_CONNECTION)
    private readonly ssoPermissionModel: Model<SsoPermissionDocument>
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
  }

  /**
   * Get all permissions for this application
   */
  async getPermissions(): Promise<SsoPermission[]> {
    return this.ssoPermissionModel
      .find({ app_id: this.appId, isActive: true })
      .sort({ group: 1, permission: 1 })
      .lean()
      .exec();
  }

  /**
   * Get permissions grouped by group name
   */
  async getPermissionsGrouped(): Promise<PermissionGroup[]> {
    const permissions = await this.getPermissions();

    const groupMap = new Map<string, SsoPermission[]>();
    for (const permission of permissions) {
      const group = permission.group;
      if (!groupMap.has(group)) {
        groupMap.set(group, []);
      }
      groupMap.get(group)!.push(permission);
    }

    return Array.from(groupMap.entries())
      .map(([group, permissions]) => ({
        group,
        permissions
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  /**
   * Get a permission by ID
   */
  async getPermissionById(permissionId: string): Promise<SsoPermission | null> {
    return this.ssoPermissionModel
      .findOne({ id: permissionId, app_id: this.appId })
      .lean()
      .exec();
  }

  /**
   * Get permissions by group
   */
  async getPermissionsByGroup(group: string): Promise<SsoPermission[]> {
    return this.ssoPermissionModel
      .find({ app_id: this.appId, group, isActive: true })
      .sort({ permission: 1 })
      .lean()
      .exec();
  }

  /**
   * Create a new permission
   */
  async createPermission(dto: CreatePermissionDto): Promise<SsoPermission> {
    // Check if permission already exists
    const existing = await this.ssoPermissionModel
      .findOne({ app_id: this.appId, group: dto.group, permission: dto.permission })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException("Bu izin zaten mevcut");
    }

    const permission = new this.ssoPermissionModel({
      id: uuidv4(),
      app_id: this.appId,
      group: dto.group,
      permission: dto.permission,
      description: dto.description,
      parentId: dto.parentId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await permission.save();
    return permission.toObject();
  }

  /**
   * Update a permission
   */
  async updatePermission(permissionId: string, dto: UpdatePermissionDto): Promise<SsoPermission> {
    const permission = await this.ssoPermissionModel
      .findOne({ id: permissionId, app_id: this.appId })
      .exec();

    if (!permission) {
      throw new NotFoundException("İzin bulunamadı");
    }

    if (dto.group !== undefined) permission.group = dto.group;
    if (dto.permission !== undefined) permission.permission = dto.permission;
    if (dto.description !== undefined) permission.description = dto.description;
    if (dto.parentId !== undefined) permission.parentId = dto.parentId;
    if (dto.isActive !== undefined) permission.isActive = dto.isActive;
    permission.updatedAt = new Date();

    await permission.save();
    return permission.toObject();
  }

  /**
   * Delete a permission (soft delete)
   */
  async deletePermission(permissionId: string): Promise<void> {
    await this.ssoPermissionModel.updateOne(
      { id: permissionId, app_id: this.appId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }

  /**
   * Get all unique permission groups
   */
  async getGroups(): Promise<string[]> {
    const permissions = await this.ssoPermissionModel
      .find({ app_id: this.appId, isActive: true })
      .distinct("group")
      .exec();

    return permissions.sort();
  }
}
