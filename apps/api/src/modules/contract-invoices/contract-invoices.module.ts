import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HttpModule } from "@nestjs/axios";
import { ContractInvoicesController } from "./contract-invoices.controller";
import { ContractInvoiceOrchestratorService } from "./services/contract-invoice-orchestrator.service";
import { InvoiceCreatorService } from "./services/invoice-creator.service";
import { InvoiceMapperService } from "./services/invoice-mapper.service";
import {
  ContractPayment,
  ContractPaymentSchema,
} from "../contract-payments/schemas/contract-payment.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import {
  Customer,
  CustomerSchema,
} from "../customers/schemas/customer.schema";
import { Invoice, InvoiceSchema } from "../invoices/schemas/invoice.schema";
import {
  ErpBalance,
  ErpBalanceSchema,
} from "../erp/schemas/erp-balance.schema";
import { License, LicenseSchema } from "../licenses/schemas/license.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
// Harici moduller
import { ContractPaymentsModule } from "../contract-payments";
import { CompaniesModule } from "../companies";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: ContractPayment.name, schema: ContractPaymentSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: Invoice.name, schema: InvoiceSchema },
        { name: ErpBalance.name, schema: ErpBalanceSchema },
        { name: License.name, schema: LicenseSchema },
      ],
      CONTRACT_DB_CONNECTION,
    ),
    HttpModule.register({ timeout: 30000 }),
    ContractPaymentsModule,
    CompaniesModule,
  ],
  controllers: [ContractInvoicesController],
  providers: [
    ContractInvoiceOrchestratorService,
    InvoiceCreatorService,
    InvoiceMapperService,
  ],
  exports: [ContractInvoiceOrchestratorService],
})
export class ContractInvoicesModule {}
