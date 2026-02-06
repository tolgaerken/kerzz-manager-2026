import { Controller, Get, Post, Param, Query } from "@nestjs/common";
import { ErpBalanceService } from "./services/erp-balance.service";
import { ErpBalanceQueryDto } from "./dto/erp-balance-query.dto";

@Controller("erp")
export class ErpController {
  constructor(private readonly erpBalanceService: ErpBalanceService) {}

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

  @Post("balances/refresh")
  async refreshBalances() {
    return this.erpBalanceService.fetchAndStoreAllBalances();
  }
}
