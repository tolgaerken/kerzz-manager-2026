import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from "@nestjs/common";
import { ErpSettingsService } from "./erp-settings.service";
import { CreateErpSettingDto, UpdateErpSettingDto } from "./dto";

@Controller("erp-settings")
export class ErpSettingsController {
  constructor(private readonly erpSettingsService: ErpSettingsService) {}

  @Get()
  async findAll() {
    return this.erpSettingsService.findAll();
  }

  @Post()
  async create(@Body() dto: CreateErpSettingDto) {
    return this.erpSettingsService.create(dto);
  }

  @Patch(":key")
  async update(@Param("key") key: string, @Body() dto: UpdateErpSettingDto) {
    return this.erpSettingsService.update(key, dto);
  }

  @Delete(":key")
  async delete(@Param("key") key: string) {
    return this.erpSettingsService.delete(key);
  }
}
