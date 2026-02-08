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
import { PipelinePaymentsService } from "./pipeline-payments.service";
import { CreatePipelinePaymentDto } from "./dto/create-pipeline-payment.dto";
import { UpdatePipelinePaymentDto } from "./dto/update-pipeline-payment.dto";

@Controller("pipeline-payments")
export class PipelinePaymentsController {
  constructor(private readonly service: PipelinePaymentsService) {}

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
  async create(@Body() dto: CreatePipelinePaymentDto) {
    return this.service.create(dto);
  }

  @Post("batch")
  async batchUpsert(
    @Body()
    body: {
      parentId: string;
      parentType: string;
      pipelineRef: string;
      items: Partial<CreatePipelinePaymentDto>[];
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
    @Body() dto: UpdatePipelinePaymentDto
  ) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.service.remove(id);
  }
}
