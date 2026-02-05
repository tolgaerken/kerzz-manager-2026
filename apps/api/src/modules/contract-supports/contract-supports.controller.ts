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
  UpdateContractSupportDto
} from "./dto";

@Controller("contract-supports")
export class ContractSupportsController {
  constructor(private readonly contractSupportsService: ContractSupportsService) {}

  @Get()
  async findAll(@Query() query: ContractSupportQueryDto) {
    return this.contractSupportsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractSupportsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractSupportDto) {
    return this.contractSupportsService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractSupportDto) {
    return this.contractSupportsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractSupportsService.delete(id);
  }
}
