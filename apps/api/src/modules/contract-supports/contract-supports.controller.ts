import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body
} from "@nestjs/common";
import { ContractSupportsService } from "./contract-supports.service";
import {
  ContractSupportQueryDto,
  CreateContractSupportDto,
  UpdateContractSupportDto,
  SupportsStatsQueryDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-supports")
export class ContractSupportsController {
  constructor(private readonly contractSupportsService: ContractSupportsService) {}

  @Get()
  async findAll(@Query() query: ContractSupportQueryDto) {
    return this.contractSupportsService.findAll(query);
  }

  @Get("stats")
  async getStats(@Query() query: SupportsStatsQueryDto) {
    return this.contractSupportsService.getStats(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractSupportsService.findOne(id);
  }

  @AuditLog({ module: "contract-supports", entityType: "ContractSupport" })
  @Post()
  async create(@Body() dto: CreateContractSupportDto) {
    return this.contractSupportsService.create(dto);
  }

  @AuditLog({ module: "contract-supports", entityType: "ContractSupport" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractSupportDto) {
    return this.contractSupportsService.update(id, dto);
  }

  @AuditLog({ module: "contract-supports", entityType: "ContractSupport" })
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.contractSupportsService.activate(id);
  }

  @AuditLog({ module: "contract-supports", entityType: "ContractSupport" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractSupportsService.delete(id);
  }
}
