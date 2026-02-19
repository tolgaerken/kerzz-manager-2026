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
import { Lead, LeadSchema } from "../leads/schemas/lead.schema";
import { Offer, OfferSchema } from "../offers/schemas/offer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
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

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: Invoice.name, schema: InvoiceSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
        { name: Lead.name, schema: LeadSchema },
        { name: Offer.name, schema: OfferSchema },
      ],
      CONTRACT_DB_CONNECTION
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
  ],
  controllers: [CronJobsController],
  providers: [
    InvoiceNotificationCron,
    ContractNotificationCron,
    StalePipelineCron,
    ManagerLogReminderCron,
    ProratedInvoiceCron,
    CronSchedulerService,
  ],
  exports: [
    InvoiceNotificationCron,
    ContractNotificationCron,
    StalePipelineCron,
    ManagerLogReminderCron,
    ProratedInvoiceCron,
    CronSchedulerService,
  ],
})
export class CronJobsModule {}
