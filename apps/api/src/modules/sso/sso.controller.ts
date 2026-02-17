import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { Request } from "express";
import { SsoUsersService, AssignUserDto, AddUserToAppDto, UpdateUserDto } from "./sso-users.service";
import { SsoRolesService, CreateRoleDto, UpdateRoleDto } from "./sso-roles.service";
import {
  SsoPermissionsService,
  CreatePermissionDto,
  UpdatePermissionDto
} from "./sso-permissions.service";
import {
  SsoApplicationsService,
  CreateApplicationDto,
  UpdateApplicationDto
} from "./sso-applications.service";
import { SsoApiKeysService, CreateApiKeyDto, UpdateApiKeyDto } from "./sso-api-keys.service";
import {
  SsoAppLicensesService,
  CreateAppLicenseDto,
  UpdateAppLicenseDto
} from "./sso-app-licenses.service";
import { SsoUserAppsService, CreateUserAppDto, UpdateUserAppDto } from "./sso-user-apps.service";
import { SsoLicensesService, LicenseSearchParams } from "./sso-licenses.service";
import { RequirePermission } from "../auth/decorators/require-permission.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PERMISSIONS } from "../auth/constants/permissions";
import { AuditLog } from "../system-logs";

@Controller("sso")
@RequirePermission(PERMISSIONS.SSO_MANAGEMENT_MENU)
export class SsoController {
  constructor(
    private readonly usersService: SsoUsersService,
    private readonly rolesService: SsoRolesService,
    private readonly permissionsService: SsoPermissionsService,
    private readonly applicationsService: SsoApplicationsService,
    private readonly apiKeysService: SsoApiKeysService,
    private readonly appLicensesService: SsoAppLicensesService,
    private readonly userAppsService: SsoUserAppsService,
    private readonly licensesService: SsoLicensesService
  ) {}

  // ==================== USERS ====================

  /**
   * Get all users assigned to an application
   * @param appId - Optional specific app ID to filter by
   * @param all - If true, get users from all applications
   */
  @Get("users")
  async getAppUsers(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Query("appId") appId?: string,
    @Query("all") all?: string
  ) {
    // all=true ise tüm kullanıcıları getir
    if (all === "true") {
      return this.usersService.getAllUsers();
    }
    // appId belirtilmişse o uygulamanın kullanıcılarını getir
    if (appId) {
      return this.usersService.getAppUsers(appId);
    }
    // Varsayılan olarak mevcut uygulamanın kullanıcılarını getir
    return this.usersService.getAppUsers(req.user?.appId);
  }

  /**
   * Search users in SSO database
   */
  @Get("users/search")
  async searchUsers(@Query("q") query: string, @Query("limit") limit?: number) {
    return this.usersService.searchUsers(query, limit);
  }

  /**
   * Get a user by ID
   */
  @Get("users/:userId")
  async getUserById(@Param("userId") userId: string) {
    return this.usersService.getUserById(userId);
  }

  /**
   * Assign a user to this application
   */
  @AuditLog({ module: "sso", entityType: "SsoUser" })
  @Post("users/assign")
  @HttpCode(HttpStatus.CREATED)
  async assignUser(@Body() dto: AssignUserDto) {
    return this.usersService.assignUserToApp(dto);
  }

  /**
   * Add a user to an application
   * If user exists (by email or phone), use existing user
   * If user doesn't exist, create new user first
   */
  @AuditLog({ module: "sso", entityType: "SsoUser" })
  @Post("users/add")
  @HttpCode(HttpStatus.CREATED)
  async addUser(@Body() dto: AddUserToAppDto) {
    return this.usersService.addUserToApp(dto);
  }

  /**
   * Update a user's details
   */
  @AuditLog({ module: "sso", entityType: "SsoUser" })
  @Put("users/:userId")
  async updateUser(@Param("userId") userId: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(userId, dto);
  }

  /**
   * Remove a user from this application
   */
  @AuditLog({ module: "sso", entityType: "SsoUser" })
  @Delete("users/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(@Param("userId") userId: string) {
    await this.usersService.removeUserFromApp(userId);
  }

  /**
   * Update user's roles
   */
  @AuditLog({ module: "sso", entityType: "SsoUser" })
  @Put("users/:userId/roles")
  async updateUserRoles(@Param("userId") userId: string, @Body("roles") roles: string[]) {
    return this.usersService.updateUserRoles(userId, roles);
  }

  /**
   * Get user's roles
   */
  @Get("users/:userId/roles")
  async getUserRoles(@Param("userId") userId: string) {
    return this.usersService.getUserRoles(userId);
  }

  // ==================== ROLES ====================

  /**
   * Get roles - supports filtering by app and getting all
   */
  @Get("roles")
  async getRoles(
    @Query("all") all?: string,
    @Query("appId") appId?: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    const inactive = includeInactive === "true";

    // If all=true, get roles from all applications
    if (all === "true") {
      return this.rolesService.getAllRoles(inactive);
    }

    // If appId specified, get roles for that app
    if (appId) {
      return this.rolesService.getRolesByAppId(appId, inactive);
    }

    // Default: get roles for current app only
    return this.rolesService.getRoles();
  }

  /**
   * Get a role by ID with its permissions
   */
  @Get("roles/:roleId")
  async getRoleById(@Param("roleId") roleId: string) {
    return this.rolesService.getRoleWithPermissions(roleId);
  }

  /**
   * Create a new role
   */
  @AuditLog({ module: "sso", entityType: "SsoRole" })
  @Post("roles")
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  /**
   * Update a role
   */
  @AuditLog({ module: "sso", entityType: "SsoRole" })
  @Put("roles/:roleId")
  async updateRole(@Param("roleId") roleId: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(roleId, dto);
  }

  /**
   * Delete a role
   */
  @AuditLog({ module: "sso", entityType: "SsoRole" })
  @Delete("roles/:roleId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param("roleId") roleId: string) {
    await this.rolesService.deleteRole(roleId);
  }

  /**
   * Set permissions for a role
   */
  @AuditLog({ module: "sso", entityType: "SsoRole" })
  @Put("roles/:roleId/permissions")
  async setRolePermissions(
    @Param("roleId") roleId: string,
    @Body("permissions") permissions: string[]
  ) {
    await this.rolesService.setRolePermissions(roleId, permissions);
    return { success: true };
  }

  // ==================== PERMISSIONS ====================

  /**
   * Get permissions - supports filtering by app and getting all
   */
  @Get("permissions")
  async getPermissions(
    @Query("all") all?: string,
    @Query("appId") appId?: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    const inactive = includeInactive === "true";

    // If all=true, get permissions from all applications
    if (all === "true") {
      return this.permissionsService.getAllPermissions(inactive);
    }

    // If appId specified, get permissions for that app
    if (appId) {
      return this.permissionsService.getPermissionsByAppId(appId, inactive);
    }

    // Default: get permissions for current app only
    return this.permissionsService.getPermissions();
  }

  /**
   * Get permissions grouped by group name
   */
  @Get("permissions/grouped")
  async getPermissionsGrouped(
    @Query("all") all?: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    if (all === "true") {
      return this.permissionsService.getAllPermissionsGrouped(includeInactive === "true");
    }
    return this.permissionsService.getPermissionsGrouped();
  }

  /**
   * Get all permission groups
   */
  @Get("permissions/groups")
  async getPermissionGroups(
    @Query("all") all?: string,
    @Query("includeInactive") includeInactive?: string
  ) {
    if (all === "true") {
      return this.permissionsService.getAllGroups(includeInactive === "true");
    }
    return this.permissionsService.getGroups();
  }

  /**
   * Get a permission by ID
   */
  @Get("permissions/:permissionId")
  async getPermissionById(@Param("permissionId") permissionId: string) {
    return this.permissionsService.getPermissionById(permissionId);
  }

  /**
   * Create a new permission
   */
  @AuditLog({ module: "sso", entityType: "SsoPermission" })
  @Post("permissions")
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.createPermission(dto);
  }

  /**
   * Update a permission
   */
  @AuditLog({ module: "sso", entityType: "SsoPermission" })
  @Put("permissions/:permissionId")
  async updatePermission(
    @Param("permissionId") permissionId: string,
    @Body() dto: UpdatePermissionDto
  ) {
    return this.permissionsService.updatePermission(permissionId, dto);
  }

  /**
   * Delete a permission
   */
  @AuditLog({ module: "sso", entityType: "SsoPermission" })
  @Delete("permissions/:permissionId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Param("permissionId") permissionId: string) {
    await this.permissionsService.deletePermission(permissionId);
  }

  // ==================== APPLICATIONS ====================

  /**
   * Get all applications
   */
  @Get("applications")
  async getApplications(@Query("includeInactive") includeInactive?: string) {
    if (includeInactive === "true") {
      return this.applicationsService.getAllApplications();
    }
    return this.applicationsService.getApplications();
  }

  /**
   * Get an application by ID
   */
  @Get("applications/:applicationId")
  async getApplicationById(@Param("applicationId") applicationId: string) {
    return this.applicationsService.getApplicationById(applicationId);
  }

  /**
   * Create a new application
   */
  @AuditLog({ module: "sso", entityType: "SsoApplication" })
  @Post("applications")
  @HttpCode(HttpStatus.CREATED)
  async createApplication(@Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(dto);
  }

  /**
   * Update an application
   */
  @AuditLog({ module: "sso", entityType: "SsoApplication" })
  @Put("applications/:applicationId")
  async updateApplication(
    @Param("applicationId") applicationId: string,
    @Body() dto: UpdateApplicationDto
  ) {
    return this.applicationsService.updateApplication(applicationId, dto);
  }

  /**
   * Delete an application
   */
  @AuditLog({ module: "sso", entityType: "SsoApplication" })
  @Delete("applications/:applicationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApplication(@Param("applicationId") applicationId: string) {
    await this.applicationsService.deleteApplication(applicationId);
  }

  // ==================== API KEYS ====================

  /**
   * Get all API keys
   */
  @Get("api-keys")
  async getApiKeys() {
    return this.apiKeysService.getApiKeys();
  }

  /**
   * Get API keys by application
   */
  @Get("api-keys/by-app/:appId")
  async getApiKeysByApp(@Param("appId") appId: string) {
    return this.apiKeysService.getApiKeysByApp(appId);
  }

  /**
   * Get an API key by ID
   */
  @Get("api-keys/:apiKeyId")
  async getApiKeyById(@Param("apiKeyId") apiKeyId: string) {
    return this.apiKeysService.getApiKeyById(apiKeyId);
  }

  /**
   * Create a new API key
   */
  @AuditLog({ module: "sso", entityType: "SsoApiKey" })
  @Post("api-keys")
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(@Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.createApiKey(dto);
  }

  /**
   * Update an API key
   */
  @AuditLog({ module: "sso", entityType: "SsoApiKey" })
  @Put("api-keys/:apiKeyId")
  async updateApiKey(@Param("apiKeyId") apiKeyId: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeysService.updateApiKey(apiKeyId, dto);
  }

  /**
   * Delete an API key
   */
  @AuditLog({ module: "sso", entityType: "SsoApiKey" })
  @Delete("api-keys/:apiKeyId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApiKey(@Param("apiKeyId") apiKeyId: string) {
    await this.apiKeysService.deleteApiKey(apiKeyId);
  }

  /**
   * Regenerate an API key
   */
  @AuditLog({ module: "sso", entityType: "SsoApiKey" })
  @Post("api-keys/:apiKeyId/regenerate")
  async regenerateApiKey(@Param("apiKeyId") apiKeyId: string) {
    return this.apiKeysService.regenerateApiKey(apiKeyId);
  }

  // ==================== APP LICENSES ====================

  /**
   * Get all app licenses
   */
  @Get("app-licenses")
  async getAppLicenses() {
    return this.appLicensesService.getAppLicenses();
  }

  /**
   * Get app licenses by user
   */
  @Get("app-licenses/by-user/:userId")
  async getAppLicensesByUser(@Param("userId") userId: string) {
    return this.appLicensesService.getAppLicensesByUser(userId);
  }

  /**
   * Get app licenses by app
   */
  @Get("app-licenses/by-app/:appId")
  async getAppLicensesByApp(@Param("appId") appId: string) {
    return this.appLicensesService.getAppLicensesByApp(appId);
  }

  /**
   * Get an app license by ID
   */
  @Get("app-licenses/:licenseId")
  async getAppLicenseById(@Param("licenseId") licenseId: string) {
    return this.appLicensesService.getAppLicenseById(licenseId);
  }

  /**
   * Create a new app license
   */
  @AuditLog({ module: "sso", entityType: "SsoAppLicense" })
  @Post("app-licenses")
  @HttpCode(HttpStatus.CREATED)
  async createAppLicense(@Body() dto: CreateAppLicenseDto) {
    return this.appLicensesService.createAppLicense(dto);
  }

  /**
   * Update an app license
   */
  @AuditLog({ module: "sso", entityType: "SsoAppLicense" })
  @Put("app-licenses/:licenseId")
  async updateAppLicense(
    @Param("licenseId") licenseId: string,
    @Body() dto: UpdateAppLicenseDto
  ) {
    return this.appLicensesService.updateAppLicense(licenseId, dto);
  }

  /**
   * Delete an app license
   */
  @AuditLog({ module: "sso", entityType: "SsoAppLicense" })
  @Delete("app-licenses/:licenseId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAppLicense(@Param("licenseId") licenseId: string) {
    await this.appLicensesService.deleteAppLicense(licenseId);
  }

  /**
   * Update user roles in app license
   */
  @AuditLog({ module: "sso", entityType: "SsoAppLicense" })
  @Put("app-licenses/user-roles/:appId/:userId")
  async updateUserRolesInLicense(
    @Param("appId") appId: string,
    @Param("userId") userId: string,
    @Body("roles") roles: string[]
  ) {
    return this.appLicensesService.updateUserRoles(appId, userId, roles);
  }

  // ==================== USER APPS ====================

  /**
   * Get all user-app assignments
   */
  @Get("user-apps")
  async getUserApps() {
    return this.userAppsService.getUserApps();
  }

  /**
   * Get user-app assignments by user
   */
  @Get("user-apps/by-user/:userId")
  async getUserAppsByUser(@Param("userId") userId: string) {
    return this.userAppsService.getUserAppsByUser(userId);
  }

  /**
   * Get user-app assignments by app
   */
  @Get("user-apps/by-app/:appId")
  async getUserAppsByApp(@Param("appId") appId: string) {
    return this.userAppsService.getUserAppsByApp(appId);
  }

  /**
   * Get a user-app assignment by ID
   */
  @Get("user-apps/:userAppId")
  async getUserAppById(@Param("userAppId") userAppId: string) {
    return this.userAppsService.getUserAppById(userAppId);
  }

  /**
   * Create a new user-app assignment
   */
  @AuditLog({ module: "sso", entityType: "SsoUserApp" })
  @Post("user-apps")
  @HttpCode(HttpStatus.CREATED)
  async createUserApp(@Body() dto: CreateUserAppDto) {
    return this.userAppsService.createUserApp(dto);
  }

  /**
   * Update a user-app assignment
   */
  @AuditLog({ module: "sso", entityType: "SsoUserApp" })
  @Put("user-apps/:userAppId")
  async updateUserApp(@Param("userAppId") userAppId: string, @Body() dto: UpdateUserAppDto) {
    return this.userAppsService.updateUserApp(userAppId, dto);
  }

  /**
   * Delete a user-app assignment
   */
  @AuditLog({ module: "sso", entityType: "SsoUserApp" })
  @Delete("user-apps/:userAppId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserApp(@Param("userAppId") userAppId: string) {
    await this.userAppsService.deleteUserApp(userAppId);
  }

  // ==================== LICENSES (kerzz-contract) ====================

  /**
   * Get all licenses from kerzz-contract database
   */
  @Get("licenses")
  async getLicenses(
    @Query("brand") brand?: string,
    @Query("isActive") isActive?: string,
    @Query("search") search?: string,
    @Query("limit") limit?: string,
    @Query("skip") skip?: string
  ) {
    const params: LicenseSearchParams = {};
    if (brand) params.brand = brand;
    if (isActive !== undefined) params.isActive = isActive === "true";
    if (search) params.search = search;
    if (limit) params.limit = parseInt(limit, 10);
    if (skip) params.skip = parseInt(skip, 10);

    return this.licensesService.getLicenses(params);
  }

  /**
   * Search licenses
   */
  @Get("licenses/search")
  async searchLicenses(@Query("q") query: string, @Query("limit") limit?: string) {
    return this.licensesService.searchLicenses(query, limit ? parseInt(limit, 10) : undefined);
  }

  /**
   * Get a license by ID
   */
  @Get("licenses/:licenseId")
  async getLicenseById(@Param("licenseId") licenseId: string) {
    return this.licensesService.getLicenseById(licenseId);
  }
}
