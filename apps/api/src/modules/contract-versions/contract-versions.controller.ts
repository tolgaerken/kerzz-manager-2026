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
import { ContractVersionsService } from "./contract-versions.service";
import {
  ContractVersionQueryDto,
  CreateContractVersionDto,
  UpdateContractVersionDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-versions")
export class ContractVersionsController {
  constructor(private readonly contractVersionsService: ContractVersionsService) {}

  @Get()
  async findAll(@Query() query: ContractVersionQueryDto) {
    return this.contractVersionsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractVersionsService.findOne(id);
  }

  @AuditLog({ module: "contract-versions", entityType: "ContractVersion" })
  @Post()
  async create(@Body() dto: CreateContractVersionDto) {
    return this.contractVersionsService.create(dto);
  }

  @AuditLog({ module: "contract-versions", entityType: "ContractVersion" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractVersionDto) {
    return this.contractVersionsService.update(id, dto);
  }

  @AuditLog({ module: "contract-versions", entityType: "ContractVersion" })
  @Patch(":id/activate")
  async activate(@Param("id") id: string) {
    return this.contractVersionsService.activate(id);
  }

  @AuditLog({ module: "contract-versions", entityType: "ContractVersion" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractVersionsService.delete(id);
  }
}
