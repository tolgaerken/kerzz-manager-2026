import { Controller, Get, Post, Put, Delete, Body, Param, Query, NotFoundException } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractQueryDto } from "./dto/contract-query.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("contracts")
@RequirePermission(PERMISSIONS.CONTRACT_MENU)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll(@Query() query: ContractQueryDto) {
    return this.contractsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const contract = await this.contractsService.findOne(id);
    if (!contract) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }
    return contract;
  }

  @AuditLog({ module: "contracts", entityType: "Contract" })
  @Post()
  async create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }

  @AuditLog({ module: "contracts", entityType: "Contract" })
  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractDto) {
    const contract = await this.contractsService.update(id, dto);
    if (!contract) {
      throw new NotFoundException(`Contract with id ${id} not found`);
    }
    return contract;
  }

  @AuditLog({ module: "contracts", entityType: "Contract" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractsService.delete(id);
  }
}
