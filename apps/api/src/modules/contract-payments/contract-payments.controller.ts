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
import { ContractPaymentsService } from "./contract-payments.service";
import {
  ContractPaymentQueryDto,
  CreateContractPaymentDto,
  UpdateContractPaymentDto
} from "./dto";

@Controller("contract-payments")
export class ContractPaymentsController {
  constructor(private readonly contractPaymentsService: ContractPaymentsService) {}

  @Get()
  async findAll(@Query() query: ContractPaymentQueryDto) {
    return this.contractPaymentsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractPaymentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractPaymentDto) {
    return this.contractPaymentsService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractPaymentDto) {
    return this.contractPaymentsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractPaymentsService.delete(id);
  }
}
