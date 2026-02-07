import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { EInvoicePricesController } from "./e-invoice-prices.controller";
import { EInvoicePricesService } from "./e-invoice-prices.service";
import {
  EInvoicePrice,
  EInvoicePriceSchema,
} from "./schemas/e-invoice-price.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: EInvoicePrice.name, schema: EInvoicePriceSchema }],
      CONTRACT_DB_CONNECTION,
    ),
  ],
  controllers: [EInvoicePricesController],
  providers: [EInvoicePricesService],
  exports: [EInvoicePricesService],
})
export class EInvoicePricesModule {}
