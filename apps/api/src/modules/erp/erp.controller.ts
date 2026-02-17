import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { ErpBalanceService } from "./services/erp-balance.service";
import { AccountTransactionsService } from "./services/account-transactions.service";
import { ErpBalanceQueryDto } from "./dto/erp-balance-query.dto";
import {
  AccountsQueryDto,
  TransactionsQueryDto,
  DocumentDetailQueryDto,
} from "./dto/account-transactions.dto";
import { AuditLog } from "../system-logs";

@Controller("erp")
export class ErpController {
  constructor(
    private readonly erpBalanceService: ErpBalanceService,
    private readonly accountTransactionsService: AccountTransactionsService
  ) {}

  @Get("balances")
  async findAllBalances(@Query() query: ErpBalanceQueryDto) {
    return this.erpBalanceService.findAll(query);
  }

  @Get("balances/status")
  async getBalanceStatus() {
    return this.erpBalanceService.getStatus();
  }

  @Get("balances/company/:companyId")
  async findByCompany(@Param("companyId") companyId: string) {
    return this.erpBalanceService.findByCompany(companyId);
  }

  @AuditLog({ module: "erp", entityType: "ErpBalance" })
  @Post("balances/refresh")
  async refreshBalances() {
    return this.erpBalanceService.fetchAndStoreAllBalances();
  }

  // Account Transactions Endpoints

  @Get("accounts")
  async getAccounts(@Query() query: AccountsQueryDto) {
    return this.accountTransactionsService.getAccounts(query.year, query.company);
  }

  @Get("transactions/:accountId")
  async getTransactions(
    @Param("accountId") accountId: string,
    @Query() query: TransactionsQueryDto
  ) {
    return this.accountTransactionsService.getTransactions(
      accountId,
      query.year,
      query.company
    );
  }

  @Get("document-detail/:documentId")
  async getDocumentDetail(
    @Param("documentId") documentId: string,
    @Query() query: DocumentDetailQueryDto
  ) {
    return this.accountTransactionsService.getDocumentDetail(
      query.year,
      documentId,
      query.company
    );
  }
}
