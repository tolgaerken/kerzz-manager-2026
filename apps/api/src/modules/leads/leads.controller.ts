import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { LeadsService } from "./leads.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { UpdateLeadDto } from "./dto/update-lead.dto";
import { LeadQueryDto } from "./dto/lead-query.dto";
import { AddActivityDto } from "./dto/add-activity.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("leads")
@RequirePermission(PERMISSIONS.SALES_MENU)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  async findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get("stats")
  async getStats() {
    return this.leadsService.getStats();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.leadsService.findOne(id);
  }

  @AuditLog({ module: "leads", entityType: "Lead" })
  @Post()
  async create(@Body() dto: CreateLeadDto) {
    return this.leadsService.create(dto);
  }

  @AuditLog({ module: "leads", entityType: "Lead" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @AuditLog({ module: "leads", entityType: "Lead" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.leadsService.remove(id);
  }

  @AuditLog({ module: "leads", entityType: "Lead" })
  @Post(":id/activities")
  async addActivity(
    @Param("id") id: string,
    @Body() dto: AddActivityDto
  ) {
    return this.leadsService.addActivity(id, dto);
  }
}
