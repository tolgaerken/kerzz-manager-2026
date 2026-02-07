import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  NotFoundException,
} from "@nestjs/common";
import { ManagerLogService } from "./manager-log.service";
import {
  CreateManagerLogDto,
  ManagerLogQueryDto,
  ManagerLogResponseDto,
  PaginatedManagerLogsResponseDto,
} from "./dto";

@Controller("manager-logs")
export class ManagerLogController {
  constructor(private readonly managerLogService: ManagerLogService) {}

  @Get()
  async findAll(@Query() queryDto: ManagerLogQueryDto): Promise<PaginatedManagerLogsResponseDto> {
    return this.managerLogService.findAll(queryDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ManagerLogResponseDto> {
    const log = await this.managerLogService.findOne(id);
    if (!log) {
      throw new NotFoundException(`ManagerLog with ID ${id} not found`);
    }
    return log;
  }

  @Post()
  async create(@Body() createManagerLogDto: CreateManagerLogDto): Promise<ManagerLogResponseDto> {
    return this.managerLogService.create(createManagerLogDto);
  }

  @Patch(":id/reminder/complete")
  async markReminderCompleted(@Param("id") id: string): Promise<ManagerLogResponseDto> {
    const log = await this.managerLogService.markReminderCompleted(id);
    if (!log) {
      throw new NotFoundException(`ManagerLog with ID ${id} not found`);
    }
    return log;
  }
}
