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
import { OrgLocationService } from "./org-location.service";
import {
  CreateOrgLocationDto,
  UpdateOrgLocationDto,
  OrgLocationQueryDto,
} from "./dto";
import { AuditLog } from "../system-logs";

/**
 * Organizasyon Lokasyon Controller
 * Lokasyon ön tanımlarının CRUD işlemleri
 */
@Controller("org-lookups/locations")
export class OrgLocationController {
  constructor(private readonly locationService: OrgLocationService) {}

  /**
   * Tüm lokasyonları listele (sayfalanmış)
   */
  @Get()
  async findAll(@Query() query: OrgLocationQueryDto) {
    return this.locationService.findAll(query);
  }

  /**
   * Aktif lokasyonları listele (lookup için)
   */
  @Get("active")
  async findAllActive() {
    return this.locationService.findAllActive();
  }

  /**
   * ID'ye göre lokasyon getir
   */
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.locationService.findById(id);
  }

  /**
   * Yeni lokasyon oluştur
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgLocation" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrgLocationDto) {
    return this.locationService.create(dto);
  }

  /**
   * Lokasyon güncelle
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgLocation" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOrgLocationDto) {
    return this.locationService.update(id, dto);
  }

  /**
   * Lokasyon sil
   */
  @AuditLog({ module: "org-lookups", entityType: "OrgLocation" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.locationService.delete(id);
  }
}
