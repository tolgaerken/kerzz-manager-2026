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
import { ContractItemsService } from "./contract-items.service";
import {
  ContractItemQueryDto,
  CreateContractItemDto,
  UpdateContractItemDto
} from "./dto";

@Controller("contract-items")
export class ContractItemsController {
  constructor(private readonly contractItemsService: ContractItemsService) {}

  @Get()
  async findAll(@Query() query: ContractItemQueryDto) {
    return this.contractItemsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractItemsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractItemDto) {
    return this.contractItemsService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractItemDto) {
    return this.contractItemsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractItemsService.delete(id);
  }
}
