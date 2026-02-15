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

  @Post()
  async create(@Body() dto: CreateEDocCreditDto) {
    return this.eDocCreditsService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateEDocCreditDto) {
    return this.eDocCreditsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.eDocCreditsService.delete(id);
  }

  /**
   * Kredi kaydından e-fatura oluşturur
   */
  @Post(":id/create-invoice")
  async createInvoice(@Param("id") id: string) {
    return this.creditInvoiceService.createInvoiceForCredit(id);
  }
}
