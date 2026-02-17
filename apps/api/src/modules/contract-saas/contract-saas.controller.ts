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
import { ContractSaasService } from "./contract-saas.service";
import {
  ContractSaasQueryDto,
  CreateContractSaasDto,
  UpdateContractSaasDto,
  SaasStatsQueryDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-saas")
export class ContractSaasController {
  constructor(private readonly contractSaasService: ContractSaasService) {}

  @Get()
  async findAll(@Query() query: ContractSaasQueryDto) {
    return this.contractSaasService.findAll(query);
  }

  @Get("stats")
  async getStats(@Query() query: SaasStatsQueryDto) {
    return this.contractSaasService.getStats(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractSaasService.findOne(id);
  }

  @AuditLog({ module: "contract-saas", entityType: "ContractSAAS" })
  @Post()
  async create(@Body() dto: CreateContractSaasDto) {
    return this.contractSaasService.create(dto);
  }

  @AuditLog({ module: "contract-saas", entityType: "ContractSAAS" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractSaasDto) {
    return this.contractSaasService.update(id, dto);
  }

  @AuditLog({ module: "contract-saas", entityType: "ContractSAAS" })
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.contractSaasService.activate(id);
  }

  @AuditLog({ module: "contract-saas", entityType: "ContractSAAS" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractSaasService.delete(id);
  }
}
