import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
} from "@nestjs/common";
import { BankTransactionsService } from "./services/bank-transactions.service";
import { BankSummaryService } from "./services/bank-summary.service";
import { ErpBankProxyService } from "./services/erp-bank-proxy.service";
import { BankTransactionQueryDto, UpdateBankTransactionDto } from "./dto";
import { AuditLog } from "../system-logs";

@Controller("bank-transactions")
export class BankTransactionsController {
  constructor(
    private readonly bankTransactionsService: BankTransactionsService,
    private readonly bankSummaryService: BankSummaryService,
    private readonly erpBankProxyService: ErpBankProxyService,
  ) {}

  // --- Spesifik route'lar once tanimlanmali ---

  /**
   * Banka bazli ozet (giris/cikis/bakiye)
   */
  @Get("summary")
  async getSummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.bankSummaryService.getSummary(startDate, endDate);
  }

  /**
   * ERP banka haritalari
   */
  @Get("erp/bank-maps")
  async getErpBankMaps() {
    return this.erpBankProxyService.getErpBankMaps();
  }

  /**
   * ERP cari hesap kodlari
   */
  @Get("erp/accounts/:companyId")
  async getErpAccounts(@Param("companyId") companyId: string) {
    return this.erpBankProxyService.getErpAccounts(companyId);
  }

  /**
   * ERP muhasebe hesap kodlari
   */
  @Get("erp/gl-accounts/:companyId")
  async getErpGlAccounts(@Param("companyId") companyId: string) {
    return this.erpBankProxyService.getErpGlAccounts(companyId);
  }

  // --- CRUD Endpoint'leri ---

  /**
   * Tum banka islemlerini listele (tarih, banka, durum filtreli)
   */
  @Get()
  async findAll(@Query() query: BankTransactionQueryDto) {
    return this.bankTransactionsService.findAll(query);
  }

  /**
   * Tekil banka islemi getir
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.bankTransactionsService.findOne(id);
  }

  /**
   * Banka islemi guncelle (ERP kodlari, durum)
   */
  @AuditLog({ module: "bank-transactions", entityType: "BankTransaction" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateBankTransactionDto,
  ) {
    return this.bankTransactionsService.update(id, dto);
  }
}
