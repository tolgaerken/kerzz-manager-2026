import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { LocationsController } from "./locations.controller";
import { LocationsService } from "./locations.service";
import { Country, CountrySchema } from "./schemas/country.schema";
import { CityTr, CityTrSchema } from "./schemas/city-tr.schema";
import { TownTr, TownTrSchema } from "./schemas/town-tr.schema";
import { DistrictTr, DistrictTrSchema } from "./schemas/district-tr.schema";

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: Country.name, schema: CountrySchema },
        { name: CityTr.name, schema: CityTrSchema },
        { name: TownTr.name, schema: TownTrSchema },
        { name: DistrictTr.name, schema: DistrictTrSchema },
      ],
      HELPERS_DB_CONNECTION,
    ),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
