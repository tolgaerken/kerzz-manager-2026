import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { EInvoicePricesService } from "./e-invoice-prices.service";
import {
  EInvoicePriceQueryDto,
  CreateEInvoicePriceDto,
  UpdateEInvoicePriceDto,
  BulkUpsertItemDto,
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("e-invoice-prices")
export class EInvoicePricesController {
  constructor(private readonly service: EInvoicePricesService) {}

  @Get()
  async findAll(@Query() query: EInvoicePriceQueryDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @AuditLog({ module: "e-invoice-prices", entityType: "EInvoicePrice" })
  @Post()
  async create(@Body() dto: CreateEInvoicePriceDto) {
    return this.service.create(dto);
  }

  @AuditLog({ module: "e-invoice-prices", entityType: "EInvoicePrice" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateEInvoicePriceDto,
  ) {
    return this.service.update(id, dto);
  }

  @AuditLog({ module: "e-invoice-prices", entityType: "EInvoicePrice" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.service.delete(id);
  }

  @AuditLog({ module: "e-invoice-prices", entityType: "EInvoicePrice" })
  @Post("bulk-upsert")
  async bulkUpsert(@Body() items: BulkUpsertItemDto[]) {
    return this.service.bulkUpsert(items);
  }

  @AuditLog({ module: "e-invoice-prices", entityType: "EInvoicePrice" })
  @Delete("by-customer/:customerErpId")
  async deleteByCustomer(
    @Param("customerErpId") customerErpId: string,
  ) {
    return this.service.deleteByCustomerErpId(customerErpId);
  }
}
