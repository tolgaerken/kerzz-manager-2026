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
import { SoftwareProductsService } from "./software-products.service";
import { SoftwareProductQueryDto } from "./dto/software-product-query.dto";
import { CreateSoftwareProductDto } from "./dto/create-software-product.dto";
import { UpdateSoftwareProductDto } from "./dto/update-software-product.dto";

@Controller("software-products")
export class SoftwareProductsController {
  constructor(private readonly softwareProductsService: SoftwareProductsService) {}

  @Get()
  findAll(@Query() query: SoftwareProductQueryDto) {
    return this.softwareProductsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.softwareProductsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateSoftwareProductDto) {
    return this.softwareProductsService.create(createDto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDto: UpdateSoftwareProductDto) {
    return this.softwareProductsService.update(id, updateDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.softwareProductsService.remove(id);
  }
}
