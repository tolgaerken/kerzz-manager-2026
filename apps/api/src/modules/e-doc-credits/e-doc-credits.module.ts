import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { EDocCreditsController } from "./e-doc-credits.controller";
import { EDocCreditsService } from "./e-doc-credits.service";
import { EInvoiceService } from "./services/e-invoice.service";
import { CreditInvoiceService } from "./services/credit-invoice.service";
import { EDocCredit, EDocCreditSchema } from "./schemas/e-doc-credit.schema";
import {
  Customer,
  CustomerSchema,
} from "../customers/schemas/customer.schema";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { CustomersModule } from "../customers/customers.module";
import { CompaniesModule } from "../companies/companies.module";
import { InvoicesModule } from "../invoices/invoices.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: EDocCredit.name, schema: EDocCreditSchema }],
      HELPERS_DB_CONNECTION,
    ),
    MongooseModule.forFeature(
      [{ name: Customer.name, schema: CustomerSchema }],
      CONTRACT_DB_CONNECTION,
    ),
    HttpModule,
    CustomersModule,
    CompaniesModule,
    InvoicesModule,
  ],
  controllers: [EDocCreditsController],
  providers: [EDocCreditsService, EInvoiceService, CreditInvoiceService],
  exports: [EDocCreditsService],
})
export class EDocCreditsModule {}
