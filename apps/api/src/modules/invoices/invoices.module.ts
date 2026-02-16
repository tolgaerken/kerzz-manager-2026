import { Module, OnModuleInit } from "@nestjs/common";
import { InjectConnection, MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import {
  Invoice,
  InvoiceSchema,
  setInvoiceConnection,
} from "./schemas/invoice.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Invoice.name, schema: InvoiceSchema }],
      CONTRACT_DB_CONNECTION
    ),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule implements OnModuleInit {
  constructor(
    @InjectConnection(CONTRACT_DB_CONNECTION)
    private readonly connection: Connection
  ) {}

  onModuleInit(): void {
    // Invoice-ContractPayment sync plugin için connection'ı set et
    setInvoiceConnection(this.connection);
  }
}
