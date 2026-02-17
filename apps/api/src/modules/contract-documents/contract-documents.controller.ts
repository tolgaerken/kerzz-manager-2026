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
import { ContractDocumentsService } from "./contract-documents.service";
import {
  ContractDocumentQueryDto,
  CreateContractDocumentDto,
  UpdateContractDocumentDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-documents")
export class ContractDocumentsController {
  constructor(private readonly contractDocumentsService: ContractDocumentsService) {}

  @Get()
  async findAll(@Query() query: ContractDocumentQueryDto) {
    return this.contractDocumentsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractDocumentsService.findOne(id);
  }

  @AuditLog({ module: "contract-documents", entityType: "ContractDocument" })
  @Post()
  async create(@Body() dto: CreateContractDocumentDto) {
    return this.contractDocumentsService.create(dto);
  }

  @AuditLog({ module: "contract-documents", entityType: "ContractDocument" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractDocumentDto) {
    return this.contractDocumentsService.update(id, dto);
  }

  @AuditLog({ module: "contract-documents", entityType: "ContractDocument" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractDocumentsService.delete(id);
  }
}
