import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { PipelineLicensesService } from "./pipeline-licenses.service";
import { CreatePipelineLicenseDto } from "./dto/create-pipeline-license.dto";
import { UpdatePipelineLicenseDto } from "./dto/update-pipeline-license.dto";
import { AuditLog } from "../../system-logs";

@Controller("pipeline-licenses")
export class PipelineLicensesController {
  constructor(private readonly service: PipelineLicensesService) {}

  @Get()
  async findByParent(
    @Query("parentId") parentId: string,
    @Query("parentType") parentType: string
  ) {
    return this.service.findByParent(parentId, parentType);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @AuditLog({ module: "pipeline-licenses", entityType: "PipelineLicense" })
  @Post()
  async create(@Body() dto: CreatePipelineLicenseDto) {
    return this.service.create(dto);
  }

  @AuditLog({ module: "pipeline-licenses", entityType: "PipelineLicense" })
  @Post("batch")
  async batchUpsert(
    @Body()
    body: {
      parentId: string;
      parentType: string;
      pipelineRef: string;
      items: Partial<CreatePipelineLicenseDto>[];
    }
  ) {
    return this.service.batchUpsert(
      body.parentId,
      body.parentType,
      body.pipelineRef,
      body.items
    );
  }

  @AuditLog({ module: "pipeline-licenses", entityType: "PipelineLicense" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePipelineLicenseDto
  ) {
    return this.service.update(id, dto);
  }

  @AuditLog({ module: "pipeline-licenses", entityType: "PipelineLicense" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
