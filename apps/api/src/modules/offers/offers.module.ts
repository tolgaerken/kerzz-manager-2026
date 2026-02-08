import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OffersController } from "./offers.controller";
import { OffersService } from "./offers.service";
import { Offer, OfferSchema } from "./schemas/offer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { PipelineModule } from "../pipeline";
import { LeadsModule } from "../leads";
import { CustomersModule } from "../customers";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: Offer.name, schema: OfferSchema }],
      CONTRACT_DB_CONNECTION
    ),
    PipelineModule,
    LeadsModule,
    CustomersModule,
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
