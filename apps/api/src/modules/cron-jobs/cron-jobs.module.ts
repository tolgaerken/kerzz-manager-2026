import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { InvoiceNotificationCron } from "./invoice-notification.cron";
import { ContractNotificationCron } from "./contract-notification.cron";
import { StalePipelineCron } from "./stale-pipeline.cron";
import { ManagerLogReminderCron } from "./manager-log-reminder.cron";
import { ProratedInvoiceCron } from "./prorated-invoice.cron";
import { CronSchedulerService } from "./cron-scheduler.service";
import { CronJobsController } from "./cron-jobs.controller";
import { Invoice, InvoiceSchema } from "../invoices/schemas/invoice.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { Customer, CustomerSchema } from "../customers/schemas/customer.schema";
import { ContractUser, ContractUserSchema } from "../contract-users/schemas/contract-user.schema";
import { Lead, LeadSchema } from "../leads/schemas/lead.schema";
import { Offer, OfferSchema } from "../offers/schemas/offer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { NotificationSettingsModule } from "../notification-settings";
import { NotificationDispatchModule } from "../notification-dispatch";
import { PaymentsModule } from "../payments/payments.module";
import { SystemLogsModule } from "../system-logs";
import {
  ManagerNotification,
  ManagerNotificationSchema,
} from "../manager-notification/schemas/manager-notification.schema";
import { ManagerNotificationModule } from "../manager-notification";
import { ManagerLogModule } from "../manager-log/manager-log.module";
import { ContractPaymentsModule } from "../contract-payments";
import { ContractInvoicesModule } from "../contract-invoices/contract-invoices.module";
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
import { ExchangeRateModule } from "../exchange-rate";
import { AnnualContractRenewalPricingService } from "./services/annual-contract-renewal-pricing.service";
import { ContractPaymentLinkHelper } from "./services/contract-payment-link.helper";
import { EmailModule } from "../email/email.module";
import { NotificationContactService } from "../notification-queue/notification-contact.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: Invoice.name, schema: InvoiceSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: ContractUser.name, schema: ContractUserSchema },
        { name: Lead.name, schema: LeadSchema },
        { name: Offer.name, schema: OfferSchema },
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
    MongooseModule.forFeature([
      { name: ManagerNotification.name, schema: ManagerNotificationSchema },
    ]),
    NotificationSettingsModule,
    NotificationDispatchModule,
    PaymentsModule,
    SystemLogsModule,
    ManagerNotificationModule,
    ManagerLogModule,
    ContractPaymentsModule,
    ContractInvoicesModule,
    ExchangeRateModule,
    EmailModule,
  ],
  controllers: [CronJobsController],
  providers: [
    InvoiceNotificationCron,
    ContractNotificationCron,
    StalePipelineCron,
    ManagerLogReminderCron,
    ProratedInvoiceCron,
    CronSchedulerService,
    AnnualContractRenewalPricingService,
    ContractPaymentLinkHelper,
    NotificationContactService,
  ],
  exports: [
    InvoiceNotificationCron,
    ContractNotificationCron,
    StalePipelineCron,
    ManagerLogReminderCron,
    ProratedInvoiceCron,
    CronSchedulerService,
    AnnualContractRenewalPricingService,
  ],
})
export class CronJobsModule {}
