import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Invoice, InvoiceSchema } from "../invoices/schemas/invoice.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { Customer, CustomerSchema } from "../customers/schemas/customer.schema";
import { ContractUser, ContractUserSchema } from "../contract-users/schemas/contract-user.schema";
import {
  ContractCashRegister,
  ContractCashRegisterSchema,
} from "../contract-cash-registers/schemas/contract-cash-register.schema";
import {
  ContractSupport,
  ContractSupportSchema,
} from "../contract-supports/schemas/contract-support.schema";
import {
  ContractItem,
  ContractItemSchema,
} from "../contract-items/schemas/contract-item.schema";
import {
  ContractSaas,
  ContractSaasSchema,
} from "../contract-saas/schemas/contract-saas.schema";
import {
  ContractVersion,
  ContractVersionSchema,
} from "../contract-versions/schemas/contract-version.schema";
import {
  InflationRate,
  InflationRateSchema,
} from "../inflation-rates/schemas/inflation-rate.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { NotificationSettingsModule } from "../notification-settings";
import { NotificationDispatchModule } from "../notification-dispatch";
import { NotificationTemplatesModule } from "../notification-templates";
import { PaymentsModule } from "../payments/payments.module";
import { ExchangeRateModule } from "../exchange-rate";
import { NotificationQueueController } from "./notification-queue.controller";
import { NotificationQueueService } from "./notification-queue.service";
import { AnnualContractRenewalPricingService } from "../cron-jobs/services/annual-contract-renewal-pricing.service";
import { ContractPaymentLinkHelper } from "../cron-jobs/services/contract-payment-link.helper";
import { NotificationContactService } from "./notification-contact.service";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Invoice.name, schema: InvoiceSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: ContractUser.name, schema: ContractUserSchema },
        { name: ContractCashRegister.name, schema: ContractCashRegisterSchema },
        { name: ContractSupport.name, schema: ContractSupportSchema },
        { name: ContractItem.name, schema: ContractItemSchema },
        { name: ContractSaas.name, schema: ContractSaasSchema },
        { name: ContractVersion.name, schema: ContractVersionSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    MongooseModule.forFeature(
      [{ name: InflationRate.name, schema: InflationRateSchema }],
      HELPERS_DB_CONNECTION
    ),
    NotificationSettingsModule,
    NotificationDispatchModule,
    NotificationTemplatesModule,
    PaymentsModule,
    ExchangeRateModule,
  ],
  controllers: [NotificationQueueController],
  providers: [
    NotificationQueueService,
    AnnualContractRenewalPricingService,
    ContractPaymentLinkHelper,
    NotificationContactService,
  ],
  exports: [NotificationQueueService, NotificationContactService],
})
export class NotificationQueueModule {}
