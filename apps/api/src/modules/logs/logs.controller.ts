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
import { LogsService } from "./logs.service";
import {
  CreateLogDto,
  LogQueryDto,
  LogResponseDto,
  PaginatedLogsResponseDto,
} from "./dto";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll(@Query() queryDto: LogQueryDto): Promise<PaginatedLogsResponseDto> {
    return this.logsService.findAll(queryDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<LogResponseDto> {
    const log = await this.logsService.findOne(id);
    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
    return log;
  }

  @Post()
  async create(@Body() createLogDto: CreateLogDto): Promise<LogResponseDto> {
    return this.logsService.create(createLogDto);
  }

  @Patch(":id/reminder/complete")
  async markReminderCompleted(@Param("id") id: string): Promise<LogResponseDto> {
    const log = await this.logsService.markReminderCompleted(id);
    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
    return log;
  }
}
