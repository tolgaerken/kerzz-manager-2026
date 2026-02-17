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
import { AuditLog } from "../system-logs";

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

  @AuditLog({ module: "contract-items", entityType: "ContractItem" })
  @Post()
  async create(@Body() dto: CreateContractItemDto) {
    return this.contractItemsService.create(dto);
  }

  @AuditLog({ module: "contract-items", entityType: "ContractItem" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractItemDto) {
    return this.contractItemsService.update(id, dto);
  }

  @AuditLog({ module: "contract-items", entityType: "ContractItem" })
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.contractItemsService.activate(id);
  }

  @AuditLog({ module: "contract-items", entityType: "ContractItem" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractItemsService.delete(id);
  }
}
