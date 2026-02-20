import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import {
  CreateInflationRateDto,
  InflationRateQueryDto,
  UpdateInflationRateDto,
} from "./dto";
import { InflationRatesService } from "./inflation-rates.service";
import { AuditLog } from "../system-logs";

@Controller("inflation-rates")
@RequirePermission(PERMISSIONS.FINANCE_MENU)
export class InflationRatesController {
  constructor(private readonly service: InflationRatesService) {}

  @Get()
  async findAll(@Query() query: InflationRateQueryDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @AuditLog({ module: "inflation-rates", entityType: "InflationRate" })
  @Post()
  async create(@Body() dto: CreateInflationRateDto) {
    return this.service.create(dto);
  }

  @AuditLog({ module: "inflation-rates", entityType: "InflationRate" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateInflationRateDto) {
    return this.service.update(id, dto);
  }

  @AuditLog({ module: "inflation-rates", entityType: "InflationRate" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
