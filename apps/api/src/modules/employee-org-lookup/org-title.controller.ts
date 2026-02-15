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
import { OrgTitleService } from "./org-title.service";
import {
  CreateOrgTitleDto,
  UpdateOrgTitleDto,
  OrgTitleQueryDto,
} from "./dto";

/**
 * Organizasyon Ünvan Controller
 * Ünvan ön tanımlarının CRUD işlemleri
 */
@Controller("org-lookups/titles")
export class OrgTitleController {
  constructor(private readonly titleService: OrgTitleService) {}

  /**
   * Tüm ünvanları listele (sayfalanmış)
   */
  @Get()
  async findAll(@Query() query: OrgTitleQueryDto) {
    return this.titleService.findAll(query);
  }

  /**
   * Aktif ünvanları listele (lookup için)
   */
  @Get("active")
  async findAllActive() {
    return this.titleService.findAllActive();
  }

  /**
   * ID'ye göre ünvan getir
   */
  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.titleService.findById(id);
  }

  /**
   * Yeni ünvan oluştur
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrgTitleDto) {
    return this.titleService.create(dto);
  }

  /**
   * Ünvan güncelle
   */
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateOrgTitleDto) {
    return this.titleService.update(id, dto);
  }

  /**
   * Ünvan sil
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.titleService.delete(id);
  }
}
