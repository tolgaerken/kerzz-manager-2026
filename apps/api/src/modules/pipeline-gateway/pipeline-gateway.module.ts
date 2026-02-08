import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PipelineGatewayController } from "./pipeline-gateway.controller";
import { Lead, LeadSchema } from "../leads/schemas/lead.schema";
import { Offer, OfferSchema } from "../offers/schemas/offer.schema";
import { Sale, SaleSchema } from "../sales/schemas/sale.schema";
import { PipelineModule } from "../pipeline";
import { OffersModule } from "../offers";
import { SalesModule } from "../sales";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Lead.name, schema: LeadSchema },
        { name: Offer.name, schema: OfferSchema },
        { name: Sale.name, schema: SaleSchema },
      ],
      CONTRACT_DB_CONNECTION
    ),
    PipelineModule,
    OffersModule,
    SalesModule,
  ],
  controllers: [PipelineGatewayController],
})
export class PipelineGatewayModule {}
