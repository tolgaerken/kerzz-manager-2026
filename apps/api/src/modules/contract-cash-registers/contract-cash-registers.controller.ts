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
  UpdateContractCashRegisterDto
} from "./dto";

@Controller("contract-cash-registers")
export class ContractCashRegistersController {
  constructor(private readonly contractCashRegistersService: ContractCashRegistersService) {}

  @Get()
  async findAll(@Query() query: ContractCashRegisterQueryDto) {
    return this.contractCashRegistersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractCashRegistersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractCashRegisterDto) {
    return this.contractCashRegistersService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractCashRegisterDto) {
    return this.contractCashRegistersService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractCashRegistersService.delete(id);
  }
}
