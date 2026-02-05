import { Controller, Get, Param, Query } from "@nestjs/common";
import { SystemLogsService } from "./system-logs.service";
import { SystemLogQueryDto } from "./dto";

@Controller("system-logs")
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
