import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { LicensesService } from "./licenses.service";
import { LicenseQueryDto } from "./dto/license-query.dto";
import { CreateLicenseDto } from "./dto/create-license.dto";
import { UpdateLicenseDto } from "./dto/update-license.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("licenses")
@RequirePermission(PERMISSIONS.LICENSE_MENU)
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Get()
  findAll(@Query() query: LicenseQueryDto) {
    return this.licensesService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.licensesService.findOne(id);
  }

  @AuditLog({ module: "licenses", entityType: "License" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licensesService.create(createLicenseDto);
  }

  @AuditLog({ module: "licenses", entityType: "License" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateLicenseDto: UpdateLicenseDto) {
    return this.licensesService.update(id, updateLicenseDto);
  }

  @AuditLog({ module: "licenses", entityType: "License" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.licensesService.remove(id);
  }
}
