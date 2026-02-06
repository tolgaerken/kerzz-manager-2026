import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Invoice, InvoiceSchema } from "../invoices/schemas/invoice.schema";
import { Contract, ContractSchema } from "../contracts/schemas/contract.schema";
import { Customer, CustomerSchema } from "../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { NotificationSettingsModule } from "../notification-settings";
import { NotificationDispatchModule } from "../notification-dispatch";
import { NotificationTemplatesModule } from "../notification-templates";
import { NotificationQueueController } from "./notification-queue.controller";
import { NotificationQueueService } from "./notification-queue.service";

@Module({
  imports: [
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
    NotificationTemplatesModule,
  ],
  controllers: [NotificationQueueController],
  providers: [NotificationQueueService],
  exports: [NotificationQueueService],
})
export class NotificationQueueModule {}
