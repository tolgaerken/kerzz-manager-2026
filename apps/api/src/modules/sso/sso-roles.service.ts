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
   * isActive filtresi: alan yoksa veya true ise dahil et, sadece false ise hariç tut
   */
  private getActiveFilter(): Record<string, unknown> {
    return {
      $or: [
        { isActive: { $exists: false } },
        { isActive: true },
        { isActive: null }
      ]
    };
  }

  /**
   * .lean() Mongoose default'larını uygulamaz; isActive alanı olmayan eski kayıtlarda
   * undefined döner. Bu metod isActive'i boolean'a normalize eder (undefined/null → true).
   */
  private normalizeIsActive(doc: SsoRole): SsoRole {
    return { ...doc, isActive: doc.isActive !== false };
  }

  private normalizeIsActiveList(docs: SsoRole[]): SsoRole[] {
    return docs.map((doc) => this.normalizeIsActive(doc));
  }

  /**
   * Get all roles for this application
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getRoles(): Promise<SsoRole[]> {
    const docs = await this.ssoRoleModel
      .find({ app_id: this.appId, ...this.getActiveFilter() })
      .sort({ name: 1 })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get all roles from all applications
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAllRoles(includeInactive = false): Promise<SsoRole[]> {
    const filter = includeInactive ? {} : this.getActiveFilter();
    const docs = await this.ssoRoleModel.find(filter).sort({ app_id: 1, name: 1 }).lean().exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get roles by application ID
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getRolesByAppId(appId: string, includeInactive = false): Promise<SsoRole[]> {
    this.logger.log(`=== getRolesByAppId START ===`);
    this.logger.log(`Input appId: "${appId}" (type: ${typeof appId}, length: ${appId?.length})`);
    
    // Önce tüm unique app_id'leri listele
    const uniqueAppIds = await this.ssoRoleModel.distinct("app_id").exec();
    this.logger.log(`All unique app_ids in DB: ${JSON.stringify(uniqueAppIds)}`);
    
    // appId içeren kayıtları regex ile ara
    const regexMatches = await this.ssoRoleModel.find({ app_id: { $regex: appId, $options: "i" } }).limit(5).lean().exec();
    this.logger.log(`Regex matches for "${appId}": ${regexMatches.length} found`);
    if (regexMatches.length > 0) {
      this.logger.log(`Sample regex matches: ${JSON.stringify(regexMatches.map(r => ({ name: r.name, app_id: r.app_id })))}`);
    }
    
    // Tam eşleşme sorgusu
    const filter: Record<string, unknown> = { app_id: appId };
    if (!includeInactive) {
      Object.assign(filter, this.getActiveFilter());
    }
    
    this.logger.log(`Exact match filter: ${JSON.stringify(filter)}`);
    
    const roles = await this.ssoRoleModel.find(filter).sort({ name: 1 }).lean().exec();
    
    this.logger.log(`Exact match result: ${roles.length} roles found`);
    this.logger.log(`=== getRolesByAppId END ===`);
    
    return this.normalizeIsActiveList(roles);
  }

  /**
   * Get a role by ID
   */
  async getRoleById(roleId: string): Promise<SsoRole | null> {
    const doc = await this.ssoRoleModel.findOne({ id: roleId }).lean().exec();
    return doc ? this.normalizeIsActive(doc) : null;
  }

  /**
   * Get a role by ID for current app only
   */
  async getRoleByIdForApp(roleId: string): Promise<SsoRole | null> {
    const doc = await this.ssoRoleModel.findOne({ id: roleId, app_id: this.appId }).lean().exec();
    return doc ? this.normalizeIsActive(doc) : null;
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
