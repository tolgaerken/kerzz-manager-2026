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

  @Post()
  async create(@Body() dto: CreatePipelineLicenseDto) {
    return this.service.create(dto);
  }

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

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePipelineLicenseDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
