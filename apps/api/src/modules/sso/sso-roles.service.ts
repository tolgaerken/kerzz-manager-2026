import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import {
  SsoRole,
  SsoRoleDocument,
  SsoRolePermission,
  SsoRolePermissionDocument
} from "./schemas";

export interface CreateRoleDto {
  name: string;
  app_id?: string;
  description?: string;
  developer?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  developer?: boolean;
  isActive?: boolean;
}

export interface RoleWithPermissions extends SsoRole {
  permissionIds: string[];
}

@Injectable()
export class SsoRolesService {
  private readonly logger = new Logger(SsoRolesService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoRole.name, SSO_DB_CONNECTION)
    private readonly ssoRoleModel: Model<SsoRoleDocument>,
    @InjectModel(SsoRolePermission.name, SSO_DB_CONNECTION)
    private readonly ssoRolePermissionModel: Model<SsoRolePermissionDocument>
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
  }

  /**
   * Get all roles for this application
   */
  async getRoles(): Promise<SsoRole[]> {
    return this.ssoRoleModel
      .find({ app_id: this.appId, isActive: true })
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  /**
   * Get all roles from all applications
   */
  async getAllRoles(includeInactive = false): Promise<SsoRole[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return this.ssoRoleModel.find(filter).sort({ app_id: 1, name: 1 }).lean().exec();
  }

  /**
   * Get roles by application ID
   */
  async getRolesByAppId(appId: string, includeInactive = false): Promise<SsoRole[]> {
    const filter: Record<string, unknown> = { app_id: appId };
    if (!includeInactive) {
      filter.isActive = true;
    }
    return this.ssoRoleModel.find(filter).sort({ name: 1 }).lean().exec();
  }

  /**
   * Get a role by ID
   */
  async getRoleById(roleId: string): Promise<SsoRole | null> {
    return this.ssoRoleModel.findOne({ id: roleId }).lean().exec();
  }

  /**
   * Get a role by ID for current app only
   */
  async getRoleByIdForApp(roleId: string): Promise<SsoRole | null> {
    return this.ssoRoleModel.findOne({ id: roleId, app_id: this.appId }).lean().exec();
  }

  /**
   * Get role with its permissions
   */
  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | null> {
    const role = await this.getRoleById(roleId);
    if (!role) return null;

    const rolePermissions = await this.ssoRolePermissionModel
      .find({ role_id: roleId })
      .lean()
      .exec();

    return {
      ...role,
      permissionIds: rolePermissions.map((rp) => rp.permission_id)
    };
  }

  /**
   * Create a new role
   */
  async createRole(dto: CreateRoleDto): Promise<SsoRole> {
    // Use provided app_id or fall back to default
    const appId = dto.app_id || this.appId;

    // Check if role name already exists for this app
    const existing = await this.ssoRoleModel
      .findOne({ app_id: appId, name: dto.name })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException("Bu isimde bir rol zaten mevcut");
    }

    const role = new this.ssoRoleModel({
      id: uuidv4(),
      app_id: appId,
      name: dto.name,
      description: dto.description,
      developer: dto.developer || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await role.save();
    return role.toObject();
  }

  /**
   * Update a role
   */
  async updateRole(roleId: string, dto: UpdateRoleDto): Promise<SsoRole> {
    const role = await this.ssoRoleModel.findOne({ id: roleId, app_id: this.appId }).exec();

    if (!role) {
      throw new NotFoundException("Rol bulunamadı");
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.developer !== undefined) role.developer = dto.developer;
    if (dto.isActive !== undefined) role.isActive = dto.isActive;
    role.updatedAt = new Date();

    await role.save();
    return role.toObject();
  }

  /**
   * Delete a role (soft delete)
   */
  async deleteRole(roleId: string): Promise<void> {
    await this.ssoRoleModel.updateOne(
      { id: roleId, app_id: this.appId },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    // Also remove role-permission mappings
    await this.ssoRolePermissionModel.deleteMany({ role_id: roleId });
  }

  /**
   * Set permissions for a role
   */
  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const role = await this.getRoleById(roleId);
    if (!role) {
      throw new NotFoundException("Rol bulunamadı");
    }

    // Remove existing permissions
    await this.ssoRolePermissionModel.deleteMany({ role_id: roleId });

    // Add new permissions
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map((permissionId) => ({
        id: uuidv4(),
        role_id: roleId,
        permission_id: permissionId,
        role_name: role.name,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await this.ssoRolePermissionModel.insertMany(rolePermissions);
    }
  }

  /**
   * Get permissions for a role
   */
  async getRolePermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await this.ssoRolePermissionModel
      .find({ role_id: roleId })
      .lean()
      .exec();

    return rolePermissions.map((rp) => rp.permission_id);
  }
}
