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
import { HardwareProductsService } from "./hardware-products.service";
import { HardwareProductQueryDto } from "./dto/hardware-product-query.dto";
import { CreateHardwareProductDto } from "./dto/create-hardware-product.dto";
import { UpdateHardwareProductDto } from "./dto/update-hardware-product.dto";
import { AuditLog } from "../system-logs";

@Controller("hardware-products")
export class HardwareProductsController {
  constructor(private readonly hardwareProductsService: HardwareProductsService) {}

  @Get()
  findAll(@Query() query: HardwareProductQueryDto) {
    return this.hardwareProductsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.hardwareProductsService.findOne(id);
  }

  @AuditLog({ module: "hardware-products", entityType: "HardwareProduct" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHardwareProductDto) {
    return this.hardwareProductsService.create(createDto);
  }

  @AuditLog({ module: "hardware-products", entityType: "HardwareProduct" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateHardwareProductDto) {
    return this.hardwareProductsService.update(id, updateDto);
  }

  @AuditLog({ module: "hardware-products", entityType: "HardwareProduct" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.hardwareProductsService.remove(id);
  }
}
