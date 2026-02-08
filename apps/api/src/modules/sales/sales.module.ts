import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SalesController } from "./sales.controller";
import { SalesService } from "./sales.service";
import { Sale, SaleSchema } from "./schemas/sale.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PipelineModule } from "../pipeline";
import { OffersModule } from "../offers";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Sale.name, schema: SaleSchema }],
      CONTRACT_DB_CONNECTION
    ),
    PipelineModule,
    OffersModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
