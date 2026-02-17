import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { EftPosModelsService } from "./eft-pos-models.service";
import { EftPosModelQueryDto } from "./dto/eft-pos-model-query.dto";
import { CreateEftPosModelDto } from "./dto/create-eft-pos-model.dto";
import { UpdateEftPosModelDto } from "./dto/update-eft-pos-model.dto";
import { AuditLog } from "../system-logs";

@Controller("eft-pos-models")
export class EftPosModelsController {
  constructor(private readonly eftPosModelsService: EftPosModelsService) {}

  @Get()
  findAll(@Query() query: EftPosModelQueryDto) {
    return this.eftPosModelsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.eftPosModelsService.findOne(id);
  }

  @AuditLog({ module: "eft-pos-models", entityType: "EftPosModel" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateEftPosModelDto) {
    return this.eftPosModelsService.create(createDto);
  }

  @AuditLog({ module: "eft-pos-models", entityType: "EftPosModel" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateEftPosModelDto) {
    return this.eftPosModelsService.update(id, updateDto);
  }

  @AuditLog({ module: "eft-pos-models", entityType: "EftPosModel" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.eftPosModelsService.remove(id);
  }
}
