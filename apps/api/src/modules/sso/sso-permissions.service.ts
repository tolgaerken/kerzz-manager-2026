import { Injectable, Logger, NotFoundException, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { SSO_DB_CONNECTION } from "../../database";
import { SsoPermission, SsoPermissionDocument, SsoRolePermission, SsoRolePermissionDocument } from "./schemas";

export interface CreatePermissionDto {
  app_id?: string;
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
    private readonly ssoPermissionModel: Model<SsoPermissionDocument>,
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
  private normalizeIsActive(doc: SsoPermission): SsoPermission {
    return { ...doc, isActive: doc.isActive !== false };
  }

  private normalizeIsActiveList(docs: SsoPermission[]): SsoPermission[] {
    return docs.map((doc) => this.normalizeIsActive(doc));
  }

  /**
   * Get all permissions for this application
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getPermissions(): Promise<SsoPermission[]> {
    const docs = await this.ssoPermissionModel
      .find({ app_id: this.appId, ...this.getActiveFilter() })
      .sort({ group: 1, permission: 1 })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get all permissions from all applications
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAllPermissions(includeInactive = false): Promise<SsoPermission[]> {
    const filter = includeInactive ? {} : this.getActiveFilter();
    const docs = await this.ssoPermissionModel
      .find(filter)
      .sort({ app_id: 1, group: 1, permission: 1 })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Get permissions by application ID
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getPermissionsByAppId(appId: string, includeInactive = false): Promise<SsoPermission[]> {
    const filter: Record<string, unknown> = { app_id: appId };
    if (!includeInactive) {
      Object.assign(filter, this.getActiveFilter());
    }
    const docs = await this.ssoPermissionModel
      .find(filter)
      .sort({ group: 1, permission: 1 })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
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
   * Get all permissions grouped (from all apps)
   */
  async getAllPermissionsGrouped(includeInactive = false): Promise<PermissionGroup[]> {
    const permissions = await this.getAllPermissions(includeInactive);

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
    const doc = await this.ssoPermissionModel.findOne({ id: permissionId }).lean().exec();
    return doc ? this.normalizeIsActive(doc) : null;
  }

  /**
   * Get a permission by ID for current app only
   */
  async getPermissionByIdForApp(permissionId: string): Promise<SsoPermission | null> {
    const doc = await this.ssoPermissionModel
      .findOne({ id: permissionId, app_id: this.appId })
      .lean()
      .exec();
    return doc ? this.normalizeIsActive(doc) : null;
  }

  /**
   * Get permissions by group
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getPermissionsByGroup(group: string): Promise<SsoPermission[]> {
    const docs = await this.ssoPermissionModel
      .find({ app_id: this.appId, group, ...this.getActiveFilter() })
      .sort({ permission: 1 })
      .lean()
      .exec();
    return this.normalizeIsActiveList(docs);
  }

  /**
   * Create a new permission
   */
  async createPermission(dto: CreatePermissionDto): Promise<SsoPermission> {
    // Use provided app_id or fall back to default
    const appId = dto.app_id || this.appId;

    // Check if permission (code) already exists for this app
    const existing = await this.ssoPermissionModel
      .findOne({ app_id: appId, permission: dto.permission })
      .lean()
      .exec();

    if (existing) {
      throw new ConflictException("Bu izin kodu zaten mevcut");
    }

    const permission = new this.ssoPermissionModel({
      id: uuidv4(),
      app_id: appId,
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

    // Check if new permission code is unique within the app (if changed)
    if (dto.permission !== undefined && dto.permission !== permission.permission) {
      const existingPermission = await this.ssoPermissionModel
        .findOne({ app_id: this.appId, permission: dto.permission, id: { $ne: permissionId } })
        .lean()
        .exec();

      if (existingPermission) {
        throw new ConflictException("Bu izin kodu zaten kullanılıyor");
      }
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
   * Delete a permission and its role-permission associations
   */
  async deletePermission(permissionId: string): Promise<void> {
    const permission = await this.ssoPermissionModel
      .findOne({ id: permissionId, app_id: this.appId })
      .lean()
      .exec();

    if (!permission) {
      throw new NotFoundException("İzin bulunamadı");
    }

    // İlişkili role-permission kayıtlarını sil
    await this.ssoRolePermissionModel.deleteMany({ permission_id: permissionId });

    // İzni veritabanından sil
    await this.ssoPermissionModel.deleteOne({ id: permissionId, app_id: this.appId });
  }

  /**
   * Get all unique permission groups for current app
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getGroups(): Promise<string[]> {
    const permissions = await this.ssoPermissionModel
      .find({ app_id: this.appId, ...this.getActiveFilter() })
      .distinct("group")
      .exec();

    return permissions.sort();
  }

  /**
   * Get all unique permission groups from all apps
   * isActive alanı yoksa veya true ise dahil eder, sadece false ise hariç tutar
   */
  async getAllGroups(includeInactive = false): Promise<string[]> {
    const filter = includeInactive ? {} : this.getActiveFilter();
    const groups = await this.ssoPermissionModel.find(filter).distinct("group").exec();

    return groups.sort();
  }
}
