import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { MongooseModule } from "@nestjs/mongoose";
import { InvoiceNotificationCron } from "./invoice-notification.cron";
import { ContractNotificationCron } from "./contract-notification.cron";
import { Invoice, InvoiceSchema } from "../invoices/schemas/invoice.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { Customer, CustomerSchema } from "../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { NotificationSettingsModule } from "../notification-settings";
import { NotificationDispatchModule } from "../notification-dispatch";
import { PaymentsModule } from "../payments/payments.module";
import { SystemLogsModule } from "../system-logs";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature(
      [
        { name: Invoice.name, schema: InvoiceSchema },
        { name: Contract.name, schema: ContractSchema },
        { name: Customer.name, schema: CustomerSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    NotificationSettingsModule,
    NotificationDispatchModule,
    PaymentsModule,
    SystemLogsModule,
  ],
  providers: [InvoiceNotificationCron, ContractNotificationCron],
  exports: [InvoiceNotificationCron, ContractNotificationCron],
})
export class CronJobsModule {}
