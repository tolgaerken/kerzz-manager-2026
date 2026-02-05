import { Controller, Get, Param, Query } from "@nestjs/common";
import { ContractsService } from "./contracts.service";
import { ContractQueryDto } from "./dto/contract-query.dto";

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
}
