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
  PipelineLogsResponseDto,
  LastByContextsDto,
  LastByContextsResponseDto,
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("manager-logs")
export class ManagerLogController {
  constructor(private readonly managerLogService: ManagerLogService) {}

  @Get()
  async findAll(@Query() queryDto: ManagerLogQueryDto): Promise<PaginatedManagerLogsResponseDto> {
    return this.managerLogService.findAll(queryDto);
  }

  @Get("pipeline/:pipelineRef")
  async findByPipeline(@Param("pipelineRef") pipelineRef: string): Promise<PipelineLogsResponseDto> {
    return this.managerLogService.findByPipeline(pipelineRef);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<ManagerLogResponseDto> {
    const log = await this.managerLogService.findOne(id);
    if (!log) {
      throw new NotFoundException(`ManagerLog with ID ${id} not found`);
    }
    return log;
  }

  @AuditLog({ module: "manager-logs", entityType: "ManagerLog" })
  @Post()
  async create(@Body() createManagerLogDto: CreateManagerLogDto): Promise<ManagerLogResponseDto> {
    return this.managerLogService.create(createManagerLogDto);
  }

  @AuditLog({ module: "manager-logs", entityType: "ManagerLog" })
  @Patch(":id/reminder/complete")
  async markReminderCompleted(@Param("id") id: string): Promise<ManagerLogResponseDto> {
    const log = await this.managerLogService.markReminderCompleted(id);
    if (!log) {
      throw new NotFoundException(`ManagerLog with ID ${id} not found`);
    }
    return log;
  }

  /**
   * Birden fazla context için son log tarihlerini batch olarak getirir.
   * Çoklu context tipi ve legacy log desteği sağlar.
   *
   * Body: {
   *   contexts: [{ type: "payment-plan", ids: ["id1", "id2"] }, { type: "contract", ids: ["cid1"] }],
   *   legacyContractIds?: string[],
   *   legacyCustomerIds?: string[],
   *   includeLegacy?: boolean,
   *   groupByField?: "contractId" | "customerId"
   * }
   *
   * Response: { [entityId]: ISO date string }
   */
  @Post("last-by-contexts")
  async findLastByContexts(
    @Body() dto: LastByContextsDto
  ): Promise<LastByContextsResponseDto> {
    return this.managerLogService.findLastLogDatesByContexts(dto);
  }
}
