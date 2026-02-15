import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import {
  InflationRate,
  InflationRateSchema,
} from "./schemas/inflation-rate.schema";
import { InflationRatesController } from "./inflation-rates.controller";
import { InflationRatesService } from "./inflation-rates.service";

@Module({
  imports: [
    MongooseModule.forFeature(
      [{ name: InflationRate.name, schema: InflationRateSchema }],
      HELPERS_DB_CONNECTION,
    ),
  ],
  controllers: [InflationRatesController],
  providers: [InflationRatesService],
  exports: [InflationRatesService],
})
export class InflationRatesModule {}
