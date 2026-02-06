import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { ErpController } from "./erp.controller";
import { ErpBalanceService } from "./services/erp-balance.service";
import { NetsisProxyService } from "./services/netsis-proxy.service";
import { ErpBalanceCron } from "./erp-balance.cron";
import { ErpBalance, ErpBalanceSchema } from "./schemas/erp-balance.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { CompaniesModule } from "../companies";
import { SystemLogsModule } from "../system-logs";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: ErpBalance.name, schema: ErpBalanceSchema }],
      CONTRACT_DB_CONNECTION
    ),
    HttpModule,
    CompaniesModule,
    SystemLogsModule,
  ],
  controllers: [ErpController],
  providers: [ErpBalanceService, NetsisProxyService, ErpBalanceCron],
  exports: [ErpBalanceService, NetsisProxyService],
})
export class ErpModule {}
