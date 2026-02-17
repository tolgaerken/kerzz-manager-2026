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
import { ContractCashRegistersService } from "./contract-cash-registers.service";
import {
  ContractCashRegisterQueryDto,
  CreateContractCashRegisterDto,
  UpdateContractCashRegisterDto,
  CashRegisterStatsQueryDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-cash-registers")
export class ContractCashRegistersController {
  constructor(private readonly contractCashRegistersService: ContractCashRegistersService) {}

  @Get()
  async findAll(@Query() query: ContractCashRegisterQueryDto) {
    return this.contractCashRegistersService.findAll(query);
  }

  @Get("stats")
  async getStats(@Query() query: CashRegisterStatsQueryDto) {
    return this.contractCashRegistersService.getStats(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractCashRegistersService.findOne(id);
  }

  @AuditLog({ module: "contract-cash-registers", entityType: "ContractCashRegister" })
  @Post()
  async create(@Body() dto: CreateContractCashRegisterDto) {
    return this.contractCashRegistersService.create(dto);
  }

  @AuditLog({ module: "contract-cash-registers", entityType: "ContractCashRegister" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractCashRegisterDto) {
    return this.contractCashRegistersService.update(id, dto);
  }

  @AuditLog({ module: "contract-cash-registers", entityType: "ContractCashRegister" })
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.contractCashRegistersService.activate(id);
  }

  @AuditLog({ module: "contract-cash-registers", entityType: "ContractCashRegister" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractCashRegistersService.delete(id);
  }
}
