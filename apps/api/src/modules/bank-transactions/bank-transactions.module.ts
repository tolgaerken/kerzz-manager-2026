import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { BankTransactionsController } from "./bank-transactions.controller";
import { BankTransactionsService } from "./services/bank-transactions.service";
import { BankSummaryService } from "./services/bank-summary.service";
import { ErpBankProxyService } from "./services/erp-bank-proxy.service";
import {
  BankTransaction,
  BankTransactionSchema,
} from "./schemas/bank-transaction.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: BankTransaction.name, schema: BankTransactionSchema }],
      CONTRACT_DB_CONNECTION,
    ),
    HttpModule,
  ],
  controllers: [BankTransactionsController],
  providers: [
    BankTransactionsService,
    BankSummaryService,
    ErpBankProxyService,
  ],
  exports: [BankTransactionsService],
})
export class BankTransactionsModule {}
