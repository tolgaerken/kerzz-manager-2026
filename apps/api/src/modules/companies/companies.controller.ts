import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { CompaniesService } from "./companies.service";
import { UpdateGroupCompanyDto } from "./dto";
import { AuditLog } from "../system-logs";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll(@Query("includeInactive") includeInactive?: string) {
    return this.companiesService.findAll(includeInactive === "true");
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.companiesService.findById(id);
  }

  @AuditLog({ module: "companies", entityType: "Company" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateGroupCompanyDto) {
    return this.companiesService.update(id, dto);
  }
}
