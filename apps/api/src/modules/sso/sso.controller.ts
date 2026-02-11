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
import { SsoUsersService, AssignUserDto } from "./sso-users.service";
import { SsoRolesService, CreateRoleDto, UpdateRoleDto } from "./sso-roles.service";
import {
  SsoPermissionsService,
  CreatePermissionDto,
  UpdatePermissionDto
} from "./sso-permissions.service";
import { RequirePermission } from "../auth/decorators/require-permission.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";

@Controller("sso")
export class SsoController {
  constructor(
    private readonly usersService: SsoUsersService,
    private readonly rolesService: SsoRolesService,
    private readonly permissionsService: SsoPermissionsService
  ) {}

  // ==================== USERS ====================

  /**
   * Get all users assigned to this application
   */
  @Get("users")
  async getAppUsers(@Req() req: Request & { user?: AuthenticatedUser }) {
    return this.usersService.getAppUsers(req.user?.appId);
  }

  /**
   * Search users in SSO database
   */
  @Get("users/search")
  @RequirePermission("userOperations")
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
  @Post("users/assign")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.CREATED)
  async assignUser(@Body() dto: AssignUserDto) {
    return this.usersService.assignUserToApp(dto);
  }

  /**
   * Remove a user from this application
   */
  @Delete("users/:userId")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(@Param("userId") userId: string) {
    await this.usersService.removeUserFromApp(userId);
  }

  /**
   * Update user's roles
   */
  @Put("users/:userId/roles")
  @RequirePermission("userOperations")
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
   * Get all roles for this application
   */
  @Get("roles")
  async getRoles() {
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
  @Post("roles")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rolesService.createRole(dto);
  }

  /**
   * Update a role
   */
  @Put("roles/:roleId")
  @RequirePermission("userOperations")
  async updateRole(@Param("roleId") roleId: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.updateRole(roleId, dto);
  }

  /**
   * Delete a role
   */
  @Delete("roles/:roleId")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param("roleId") roleId: string) {
    await this.rolesService.deleteRole(roleId);
  }

  /**
   * Set permissions for a role
   */
  @Put("roles/:roleId/permissions")
  @RequirePermission("userOperations")
  async setRolePermissions(
    @Param("roleId") roleId: string,
    @Body("permissions") permissions: string[]
  ) {
    await this.rolesService.setRolePermissions(roleId, permissions);
    return { success: true };
  }

  // ==================== PERMISSIONS ====================

  /**
   * Get all permissions for this application
   */
  @Get("permissions")
  async getPermissions() {
    return this.permissionsService.getPermissions();
  }

  /**
   * Get permissions grouped by group name
   */
  @Get("permissions/grouped")
  async getPermissionsGrouped() {
    return this.permissionsService.getPermissionsGrouped();
  }

  /**
   * Get all permission groups
   */
  @Get("permissions/groups")
  async getPermissionGroups() {
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
  @Post("permissions")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.createPermission(dto);
  }

  /**
   * Update a permission
   */
  @Put("permissions/:permissionId")
  @RequirePermission("userOperations")
  async updatePermission(
    @Param("permissionId") permissionId: string,
    @Body() dto: UpdatePermissionDto
  ) {
    return this.permissionsService.updatePermission(permissionId, dto);
  }

  /**
   * Delete a permission
   */
  @Delete("permissions/:permissionId")
  @RequirePermission("userOperations")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePermission(@Param("permissionId") permissionId: string) {
    await this.permissionsService.deletePermission(permissionId);
  }
}
