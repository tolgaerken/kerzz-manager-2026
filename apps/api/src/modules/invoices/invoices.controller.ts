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
import { InvoicesService } from "./invoices.service";
import { InvoiceQueryDto } from "./dto/invoice-query.dto";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";

@Controller("invoices")
@RequirePermission(PERMISSIONS.FINANCE_MENU)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  findAll(@Query() query: InvoiceQueryDto) {
    return this.invoicesService.findAll(query);
  }

  @Get("unpaid-summary-by-erp")
  getUnpaidSummaryByErp() {
    return this.invoicesService.getUnpaidSummaryByErp();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id);
  }

  @AuditLog({ module: "invoices", entityType: "Invoice" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @AuditLog({ module: "invoices", entityType: "Invoice" })
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @AuditLog({ module: "invoices", entityType: "Invoice" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.invoicesService.remove(id);
  }
}
