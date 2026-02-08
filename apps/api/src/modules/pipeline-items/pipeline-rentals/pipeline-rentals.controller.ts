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
import { PipelineRentalsService } from "./pipeline-rentals.service";
import { CreatePipelineRentalDto } from "./dto/create-pipeline-rental.dto";
import { UpdatePipelineRentalDto } from "./dto/update-pipeline-rental.dto";

@Controller("pipeline-rentals")
export class PipelineRentalsController {
  constructor(private readonly service: PipelineRentalsService) {}

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
  async create(@Body() dto: CreatePipelineRentalDto) {
    return this.service.create(dto);
  }

  @Post("batch")
  async batchUpsert(
    @Body()
    body: {
      parentId: string;
      parentType: string;
      pipelineRef: string;
      items: Partial<CreatePipelineRentalDto>[];
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
    @Body() dto: UpdatePipelineRentalDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
