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

  @Post()
  async create(@Body() dto: CreatePipelineProductDto) {
    return this.service.create(dto);
  }

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

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePipelineProductDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
