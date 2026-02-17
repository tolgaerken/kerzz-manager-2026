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
import { EDocCreditsService } from "./e-doc-credits.service";
import { CreditInvoiceService } from "./services/credit-invoice.service";
import {
  EDocCreditQueryDto,
  CreateEDocCreditDto,
  UpdateEDocCreditDto,
} from "./dto";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import { AuditLog } from "../system-logs";

@Controller("e-doc-credits")
@RequirePermission(PERMISSIONS.EDOC_MENU)
export class EDocCreditsController {
  constructor(
    private readonly eDocCreditsService: EDocCreditsService,
    private readonly creditInvoiceService: CreditInvoiceService,
  ) {}

  @Get()
  async findAll(@Query() query: EDocCreditQueryDto) {
    return this.eDocCreditsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.eDocCreditsService.findOne(id);
  }

  @AuditLog({ module: "e-doc-credits", entityType: "EDocCredit" })
  @Post()
  async create(@Body() dto: CreateEDocCreditDto) {
    return this.eDocCreditsService.create(dto);
  }

  @AuditLog({ module: "e-doc-credits", entityType: "EDocCredit" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateEDocCreditDto) {
    return this.eDocCreditsService.update(id, dto);
  }

  @AuditLog({ module: "e-doc-credits", entityType: "EDocCredit" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.eDocCreditsService.delete(id);
  }

  /**
   * Kredi kaydından e-fatura oluşturur
   */
  @AuditLog({ module: "e-doc-credits", entityType: "EDocCredit" })
  @Post(":id/create-invoice")
  async createInvoice(@Param("id") id: string) {
    return this.creditInvoiceService.createInvoiceForCredit(id);
  }
}
