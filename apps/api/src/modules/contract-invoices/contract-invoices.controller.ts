import { Controller, Get, Post, Body, Query } from "@nestjs/common";
import { ContractInvoiceOrchestratorService } from "./services/contract-invoice-orchestrator.service";
import { QueryPaymentPlansDto } from "./dto/query-payment-plans.dto";
import { CreateInvoicesDto } from "./dto/create-invoices.dto";
import { AuditLog } from "../system-logs";

@Controller("contract-invoices")
export class ContractInvoicesController {
  constructor(
    private readonly orchestratorService: ContractInvoiceOrchestratorService,
  ) {}

  /**
   * Belirli donem ve tarih icin odeme planlarini getirir.
   * Dinamik alanlar (balance, block) dahil edilir.
   */
  @Get("payment-plans")
  async getPaymentPlans(@Query() query: QueryPaymentPlansDto) {
    return this.orchestratorService.getPaymentPlans(query.period, query.date);
  }

  /**
   * Secili odeme planlarindan fatura olusturur.
   */
  @AuditLog({ module: "contract-invoices", entityType: "ContractInvoice" })
  @Post("create")
  async createInvoices(@Body() dto: CreateInvoicesDto) {
    return this.orchestratorService.createInvoices(dto.planIds);
  }

  /**
   * Secili odeme planlarindaki kontratlari kontrol eder / yeniden hesaplar.
   */
  @AuditLog({ module: "contract-invoices", entityType: "ContractInvoice" })
  @Post("check-contracts")
  async checkContracts(@Body() dto: CreateInvoicesDto) {
    return this.orchestratorService.checkContracts(dto.planIds);
  }
}
