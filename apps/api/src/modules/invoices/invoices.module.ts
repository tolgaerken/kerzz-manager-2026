import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { InvoicesController } from "./invoices.controller";
import { InvoicesService } from "./invoices.service";
import { Invoice, InvoiceSchema } from "./schemas/invoice.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Invoice.name, schema: InvoiceSchema }],
      CONTRACT_DB_CONNECTION
    )
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService]
})
export class InvoicesModule {}
