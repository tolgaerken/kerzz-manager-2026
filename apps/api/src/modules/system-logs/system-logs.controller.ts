import { Controller, Get, Param, Query } from "@nestjs/common";
import { SystemLogsService } from "./system-logs.service";
import { SystemLogQueryDto } from "./dto";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("system-logs")
@RequirePermission(PERMISSIONS.SYSTEM_MENU)
export class SystemLogsController {
  constructor(private readonly systemLogsService: SystemLogsService) {}

  @Get()
  findAll(@Query() query: SystemLogQueryDto) {
    return this.systemLogsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.systemLogsService.findOne(id);
  }
}
