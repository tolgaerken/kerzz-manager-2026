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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHardwareProductDto) {
    return this.hardwareProductsService.create(createDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateHardwareProductDto) {
    return this.hardwareProductsService.update(id, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.hardwareProductsService.remove(id);
  }
}
