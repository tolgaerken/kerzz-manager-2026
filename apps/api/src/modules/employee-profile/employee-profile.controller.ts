import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";
import { EmployeeProfileService, EmployeeProfileServiceContext } from "./employee-profile.service";
import {
  EmployeeProfileQueryDto,
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
  UpdateSelfProfileDto,
} from "./dto";
import { RequirePermission } from "../auth/decorators/require-permission.decorator";
import { AuditLog } from "../system-logs/decorators/audit-log.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PERMISSIONS } from "../auth/constants/permissions";

/**
 * Çalışan Profili Controller
 * 
 * Yetkilendirme:
 * - GET /employee-profiles, GET /employee-profiles/:userId -> EMPLOYEE_PROFILE_MENU
 * - POST, PATCH /:userId, DELETE -> EMPLOYEE_PROFILE_EDIT_ALL (henüz SSO'da tanımlı değil)
 * - PATCH /me -> EMPLOYEE_PROFILE_EDIT_SELF (veya herhangi bir giriş yapmış kullanıcı)
 */
@Controller("employee-profiles")
export class EmployeeProfileController {
  constructor(private readonly employeeProfileService: EmployeeProfileService) {}

  /**
   * Request'ten servis context'i oluştur
   */
  private getServiceContext(req: Request & { user?: AuthenticatedUser }): EmployeeProfileServiceContext {
    const user = req.user;
    const permissions = user?.permissions || [];
    
    return {
      userId: user?.id || "",
      isAdmin: user?.isAdmin || false,
      canViewSensitiveData:
        user?.isAdmin ||
        permissions.includes(PERMISSIONS.EMPLOYEE_PROFILE_VIEW_SENSITIVE),
      // Geçici olarak herkese edit yetkisi ver (SSO'da izin tanımlanana kadar)
      canEditAll: true,
        // user?.isAdmin ||
        // permissions.includes(PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL),
    };
  }

  /**
   * Tüm çalışan profillerini listele (sayfalanmış)
   */
  @Get()
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async findAll(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Query() query: EmployeeProfileQueryDto
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.findAll(query, context);
  }

  /**
   * İstatistikleri getir
   */
  @Get("stats")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async getStats() {
    return this.employeeProfileService.getStats();
  }

  /**
   * Kendi profilimi getir (self-service)
   */
  @Get("me")
  async findMyProfile(@Req() req: Request & { user?: AuthenticatedUser }) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.findMyProfile(context);
  }

  /**
   * Kendi profilimi güncelle (self-service - sınırlı alanlar)
   */
  @Patch("me")
  @AuditLog({ module: "employee-profile", entityType: "EmployeeProfile" })
  async updateMyProfile(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() dto: UpdateSelfProfileDto
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.updateMyProfile(dto, context);
  }

  /**
   * Departmana göre çalışanları getir
   */
  @Get("by-department/:departmentCode")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async findByDepartment(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param("departmentCode") departmentCode: string
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.findByDepartment(departmentCode, context);
  }

  /**
   * Yöneticiye bağlı çalışanları getir
   */
  @Get("by-manager/:managerUserId")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async findByManager(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param("managerUserId") managerUserId: string
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.findByManager(managerUserId, context);
  }

  /**
   * Yöneticiye bağlı tüm alt çalışanları recursive olarak getir (tree yapısında)
   * Sadece aktif çalışanları döndürür
   */
  @Get("hierarchy/:managerUserId")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async getHierarchy(@Param("managerUserId") managerUserId: string) {
    return this.employeeProfileService.getHierarchy(managerUserId);
  }

  /**
   * Yöneticiye bağlı tüm alt çalışanları recursive olarak getir (flat liste)
   * Sadece aktif çalışanları döndürür
   */
  @Get("hierarchy-flat/:managerUserId")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async getHierarchyFlat(@Param("managerUserId") managerUserId: string) {
    return this.employeeProfileService.getHierarchyFlat(managerUserId);
  }

  /**
   * Kullanıcı ID'sine göre profil getir
   */
  @Get(":userId")
  @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_MENU)
  async findByUserId(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param("userId") userId: string
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.findByUserId(userId, context);
  }

  /**
   * Yeni çalışan profili oluştur (Admin/İK)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  // @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL) // TODO: SSO'da izin tanımlandıktan sonra aktif et
  @AuditLog({ module: "employee-profile", entityType: "EmployeeProfile" })
  async create(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() dto: CreateEmployeeProfileDto
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.create(dto, context);
  }

  /**
   * Çalışan profilini güncelle (Admin/İK - tam yetki)
   */
  @Patch(":userId")
  // @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL) // TODO: SSO'da izin tanımlandıktan sonra aktif et
  @AuditLog({ module: "employee-profile", entityType: "EmployeeProfile" })
  async update(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param("userId") userId: string,
    @Body() dto: UpdateEmployeeProfileDto
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.update(userId, dto, context);
  }

  /**
   * Çalışan profilini soft-delete (terminated durumuna geçir)
   */
  @Delete(":userId")
  // @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL) // TODO: SSO'da izin tanımlandıktan sonra aktif et
  @AuditLog({ module: "employee-profile", entityType: "EmployeeProfile" })
  async softDelete(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param("userId") userId: string,
    @Body("terminationReason") terminationReason: string
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.softDelete(userId, terminationReason || "", context);
  }

  /**
   * Toplu profil oluştur (backfill için - Admin)
   */
  @Post("bulk-create")
  @HttpCode(HttpStatus.OK)
  // @RequirePermission(PERMISSIONS.EMPLOYEE_PROFILE_EDIT_ALL) // TODO: SSO'da izin tanımlandıktan sonra aktif et
  @AuditLog({ module: "employee-profile", entityType: "EmployeeProfile" })
  async bulkCreate(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body("userIds") userIds: string[]
  ) {
    const context = this.getServiceContext(req);
    return this.employeeProfileService.bulkCreate(userIds, context);
  }
}
