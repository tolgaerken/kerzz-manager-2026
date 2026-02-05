import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query
} from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CustomerQueryDto } from "./dto/customer-query.dto";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: CreateCustomerDto) {
    return this.customersService.create(createDto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateDto: UpdateCustomerDto) {
    return this.customersService.update(id, updateDto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.customersService.remove(id);
  }
}
