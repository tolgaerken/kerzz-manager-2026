import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractQueryDto } from "./dto/contract-query.dto";
import { CreateContractDto } from "./dto/create-contract.dto";
import { AuditLog } from "../system-logs";

@Controller("contracts")
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
