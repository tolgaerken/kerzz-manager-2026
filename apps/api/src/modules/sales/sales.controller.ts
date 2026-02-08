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
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleQueryDto } from "./dto/sale-query.dto";
import { AuditLog } from "../system-logs";

@Controller("sales")
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  async findAll(@Query() query: SaleQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get("stats")
  async getStats() {
    return this.salesService.getStats();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.salesService.findOne(id);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post()
  async create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateSaleDto) {
    return this.salesService.update(id, dto);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.salesService.remove(id);
  }

  @Post(":id/calculate")
  async calculate(@Param("id") id: string) {
    return this.salesService.calculate(id);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Patch(":id/approve")
  async approve(
    @Param("id") id: string,
    @Body() body: { userId: string; userName: string }
  ) {
    return this.salesService.approve(id, body.userId, body.userName);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post(":id/revert")
  async revert(@Param("id") id: string) {
    return this.salesService.revertFromOffer(id);
  }
}
