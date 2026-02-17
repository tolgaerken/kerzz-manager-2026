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
import { PipelineProductsService } from "./pipeline-products.service";
import { CreatePipelineProductDto } from "./dto/create-pipeline-product.dto";
import { UpdatePipelineProductDto } from "./dto/update-pipeline-product.dto";
import { AuditLog } from "../../system-logs";

@Controller("pipeline-products")
export class PipelineProductsController {
  constructor(private readonly service: PipelineProductsService) {}

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

  @AuditLog({ module: "pipeline-products", entityType: "PipelineProduct" })
  @Post()
  async create(@Body() dto: CreatePipelineProductDto) {
    return this.service.create(dto);
  }

  @AuditLog({ module: "pipeline-products", entityType: "PipelineProduct" })
  @Post("batch")
  async batchUpsert(
    @Body()
    body: {
      parentId: string;
      parentType: string;
      pipelineRef: string;
      items: Partial<CreatePipelineProductDto>[];
    }
  ) {
    return this.service.batchUpsert(
      body.parentId,
      body.parentType,
      body.pipelineRef,
      body.items
    );
  }

  @AuditLog({ module: "pipeline-products", entityType: "PipelineProduct" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePipelineProductDto
  ) {
    return this.service.update(id, dto);
  }

  @AuditLog({ module: "pipeline-products", entityType: "PipelineProduct" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
