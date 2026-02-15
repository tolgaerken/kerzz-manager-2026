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

  @Post()
  async create(@Body() dto: CreateInflationRateDto) {
    return this.service.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateInflationRateDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}
