import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrgDepartmentService } from "./org-department.service";
import {
  CreateOrgDepartmentDto,
  UpdateOrgDepartmentDto,
  OrgDepartmentQueryDto,
} from "./dto";
import { AuditLog } from "../system-logs";

/**
 * Organizasyon Departman Controller
 * Departman ön tanımlarının CRUD işlemleri
 */
@Controller("org-lookups/departments")
export class OrgDepartmentController {
  constructor(private readonly departmentService: OrgDepartmentService) {}

  /**
   * Tüm departmanları listele (sayfalanmış)
   */
  @Get()
  async findAll(@Query() query: OrgDepartmentQueryDto) {
    return this.departmentService.findAll(query);
  }

  /**
   * Aktif departmanları listele (lookup için)
   */
  @Get("active")
  async findAllActive() {
    return this.departmentService.findAllActive();
  }

  /**
   * ID'ye göre departman getir
   */
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.departmentService.findById(id);
  }

  /**
   * Yeni departman oluştur
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgDepartment" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrgDepartmentDto) {
    return this.departmentService.create(dto);
  }

  /**
   * Departman güncelle
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgDepartment" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOrgDepartmentDto) {
    return this.departmentService.update(id, dto);
  }

  /**
   * Departman sil
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgDepartment" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.departmentService.delete(id);
  }
}
