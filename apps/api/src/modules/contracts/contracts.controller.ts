import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractQueryDto } from "./dto/contract-query.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
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
    return this.contractsService.findOne(id);
  }

  @AuditLog({ module: "contracts", entityType: "Contract" })
  @Post()
  async create(@Body() dto: CreateContractDto) {
    return this.contractsService.create(dto);
  }
}
