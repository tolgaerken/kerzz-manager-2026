import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { jwtDecode } from "jwt-decode";
import { SSO_DB_CONNECTION } from "../../database";
import {
  SsoUser,
  SsoUserDocument,
  SsoUserApp,
  SsoUserAppDocument,
  SsoRole,
  SsoRoleDocument,
  SsoPermission,
  SsoPermissionDocument,
  SsoRolePermission,
  SsoRolePermissionDocument,
  SsoAppLicence,
  SsoAppLicenceDocument
} from "../sso/schemas";
import {
  JwtPayload,
  AuthenticatedUser,
  UserWithPermissions,
  AppUserInfo,
  AuthMeResponse,
  SsoRole as SsoRoleType,
  SsoPermissionInfo
} from "./auth.types";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly ssoUserModel: Model<SsoUserDocument>,
    @InjectModel(SsoUserApp.name, SSO_DB_CONNECTION)
    private readonly ssoUserAppModel: Model<SsoUserAppDocument>,
    @InjectModel(SsoRole.name, SSO_DB_CONNECTION)
    private readonly ssoRoleModel: Model<SsoRoleDocument>,
    @InjectModel(SsoPermission.name, SSO_DB_CONNECTION)
    private readonly ssoPermissionModel: Model<SsoPermissionDocument>,
    @InjectModel(SsoRolePermission.name, SSO_DB_CONNECTION)
    private readonly ssoRolePermissionModel: Model<SsoRolePermissionDocument>,
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly ssoAppLicenceModel: Model<SsoAppLicenceDocument>
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "io-cloud-2025";
    this.logger.log(`AuthService initialized with APP_ID: "${this.appId}"`);
  }

  /**
   * SSO JWT Token payload yapısı
   * SSO token'ı userInfo objesini içerir
   */
  private extractUserIdFromToken(payload: Record<string, unknown>): string | undefined {
    // SSO token yapısı: { userInfo: { id: "...", name: "...", ... }, exp: ..., iat: ... }
    const userInfo = payload.userInfo as Record<string, unknown> | undefined;
    if (userInfo && typeof userInfo.id === "string") {
      return userInfo.id;
    }
    // Fallback: direkt sub veya id alanı
    if (typeof payload.sub === "string") return payload.sub;
    if (typeof payload.id === "string") return payload.id;
    return undefined;
  }

  /**
   * Decode and validate JWT token from SSO
   */
  decodeToken(token: string): JwtPayload {
    try {
      const decoded = jwtDecode<Record<string, unknown>>(token);
      this.logger.debug(`Decoded token payload: ${JSON.stringify(decoded)}`);
      
      // SSO token'dan userId'yi çıkar
      const userId = this.extractUserIdFromToken(decoded);
      
      return {
        sub: userId || "",
        exp: decoded.exp as number,
        iat: decoded.iat as number,
        userInfo: decoded.userInfo as JwtPayload["userInfo"]
      };
    } catch (error) {
      this.logger.error(`Token decode error: ${error}`);
      throw new UnauthorizedException("Geçersiz token");
    }
  }

  /**
   * Validate token and get authenticated user
   */
  async validateToken(token: string): Promise<AuthenticatedUser> {
    const payload = this.decodeToken(token);

    const userId = payload.sub;
    
    if (!userId) {
      this.logger.error(`Token has no user id. Payload: ${JSON.stringify(payload)}`);
      throw new UnauthorizedException("Token'da kullanıcı ID bulunamadı");
    }

    this.logger.debug(`Looking up user with id: ${userId}`);

    // Check if user exists in sso-db
    const user = await this.ssoUserModel.findOne({ id: userId }).lean().exec();
    if (!user) {
      throw new UnauthorizedException("Kullanıcı bulunamadı");
    }

    this.logger.debug(`User found: ${JSON.stringify({ id: user.id, name: user.name, isActive: user.isActive })}`);

    // isActive alanı açıkça false ise devre dışı kabul et
    // undefined veya true ise aktif kabul et (SSO DB'de bu alan olmayabilir)
    if (user.isActive === false) {
      throw new UnauthorizedException("Kullanıcı hesabı devre dışı");
    }

    const tokenCurrentAppId =
      payload.userInfo && typeof payload.userInfo.currentapp === "string" && payload.userInfo.currentapp.length > 0
        ? payload.userInfo.currentapp
        : undefined;
    const currentAppId = this.appId;

    if (tokenCurrentAppId && tokenCurrentAppId !== this.appId) {
      this.logger.warn(
        `Token currentapp (${tokenCurrentAppId}) APP_ID (${this.appId}) ile farkli. APP_ID baz aliniyor.`
      );
    }

    // Check if user is assigned to this app
    // Önce kullanıcının tüm app atamalarını logla (debug için)
    const allUserApps = await this.ssoUserAppModel
      .find({ user_id: userId })
      .lean()
      .exec();
    this.logger.debug(
      `User ${userId} app assignments: ${JSON.stringify(allUserApps.map((ua) => ({ app_id: ua.app_id, isActive: ua.isActive })))}`
    );
    this.logger.debug(`Looking for app_id: "${currentAppId}"`);

    const userApp = await this.ssoUserAppModel
      .findOne({ app_id: currentAppId, user_id: userId })
      .lean()
      .exec();

    if (!userApp) {
      this.logger.warn(`User ${userId} is not assigned to app ${currentAppId}. Available apps: ${allUserApps.map((ua) => ua.app_id).join(", ")}`);
      throw new UnauthorizedException("Bu uygulamaya erişim yetkiniz yok");
    }

    // isActive kontrolünü de esnek yapalım (undefined = aktif kabul et)
    if (userApp.isActive === false) {
      this.logger.warn(`User ${userId} app assignment is inactive for ${currentAppId}`);
      throw new UnauthorizedException("Bu uygulamaya erişim yetkiniz yok");
    }

    // Get user's roles and permissions for this app
    const { roles, permissions } = await this.getUserRolesAndPermissions(userId, currentAppId);

    const roleNames = roles.map((r) => r.name.toLowerCase());
    const isAdmin = roleNames.includes("veri owner") || roleNames.includes("admin");
    const isFinance = roleNames.includes("finans") || isAdmin;
    const isManager = roleNames.includes("yönetim") || roleNames.includes("müdür") || isAdmin;

    return {
      id: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      appId: currentAppId,
      roles: roles.map((r) => r.name),
      permissions: permissions.map((p) => p.permission),
      isAdmin,
      isFinance,
      isManager
    };
  }

  /**
   * Get user's roles and permissions for this app
   */
  async getUserRolesAndPermissions(
    userId: string,
    appId = this.appId
  ): Promise<{ roles: SsoRoleType[]; permissions: SsoPermissionInfo[] }> {
    // Get user's licence for this app
    const licence = await this.ssoAppLicenceModel
      .findOne({ app_id: appId, user_id: userId })
      .lean()
      .exec();

    if (!licence || !licence.roles || licence.roles.length === 0) {
      return { roles: [], permissions: [] };
    }

    // Get role details
    const roles = await this.ssoRoleModel
      .find({ id: { $in: licence.roles }, app_id: appId })
      .lean()
      .exec();

    // Get role-permission mappings
    const rolePermissions = await this.ssoRolePermissionModel
      .find({ role_id: { $in: licence.roles } })
      .lean()
      .exec();

    const permissionIds = [...new Set(rolePermissions.map((rp) => rp.permission_id))];

    // Get permission details
    const permissions = await this.ssoPermissionModel
      .find({ id: { $in: permissionIds }, app_id: appId })
      .lean()
      .exec();

    return {
      roles: roles.map((r) => ({
        id: r.id || "",
        name: r.name,
        developer: r.developer,
        description: r.description
      })),
      permissions: permissions.map((p) => ({
        id: p.id || "",
        group: p.group,
        permission: p.permission,
        description: p.description
      }))
    };
  }

  /**
   * Get full user profile with permissions (for /auth/me endpoint)
   */
  async getMe(userId: string): Promise<AuthMeResponse> {
    const user = await this.ssoUserModel.findOne({ id: userId }).lean().exec();
    if (!user) {
      throw new UnauthorizedException("Kullanıcı bulunamadı");
    }

    const { roles, permissions } = await this.getUserRolesAndPermissions(userId);

    const roleNames = roles.map((r) => r.name.toLowerCase());
    const isAdmin = roleNames.includes("veri owner") || roleNames.includes("admin");
    const isFinance = roleNames.includes("finans") || isAdmin;
    const isManager = roleNames.includes("yönetim") || roleNames.includes("müdür") || isAdmin;

    const userWithPermissions: UserWithPermissions = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginDate: user.lastLoginDate,
      appId: this.appId,
      roles,
      permissions,
      isAdmin,
      isFinance,
      isManager
    };

    // Get app users (other users assigned to this app)
    const appUsers = await this.getAppUsers();

    return {
      user: userWithPermissions,
      appUsers
    };
  }

  /**
   * Get all users assigned to this application
   */
  async getAppUsers(): Promise<AppUserInfo[]> {
    // Get user-app assignments for this app
    const userApps = await this.ssoUserAppModel
      .find({ app_id: this.appId, isActive: true })
      .sort({ user_name: 1 })
      .lean()
      .exec();

    if (userApps.length === 0) {
      return [];
    }

    const userIds = userApps.map((ua) => ua.user_id);

    // Get user details
    const users = await this.ssoUserModel.find({ id: { $in: userIds } }).lean().exec();

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result: AppUserInfo[] = [];
    for (const ua of userApps) {
      const user = userMap.get(ua.user_id);
      if (user) {
        result.push({
          id: ua.user_id,
          name: ua.user_name || user.name,
          email: user.email,
          phone: user.phone,
          isActive: user.isActive
        });
      }
    }
    return result;
  }

  /**
   * Verify token endpoint - returns basic validation result
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: AuthenticatedUser }> {
    try {
      const user = await this.validateToken(token);
      return { valid: true, user };
    } catch {
      return { valid: false };
    }
  }
}
