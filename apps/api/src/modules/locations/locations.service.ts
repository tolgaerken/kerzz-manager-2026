import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HELPERS_DB_CONNECTION } from "../../database/helpers-database.module";
import { Country, CountryDocument } from "./schemas/country.schema";
import { CityTr, CityTrDocument } from "./schemas/city-tr.schema";
import { TownTr, TownTrDocument } from "./schemas/town-tr.schema";
import { DistrictTr, DistrictTrDocument } from "./schemas/district-tr.schema";

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Country.name, HELPERS_DB_CONNECTION)
    private countryModel: Model<CountryDocument>,

    @InjectModel(CityTr.name, HELPERS_DB_CONNECTION)
    private cityTrModel: Model<CityTrDocument>,

    @InjectModel(TownTr.name, HELPERS_DB_CONNECTION)
    private townTrModel: Model<TownTrDocument>,

    @InjectModel(DistrictTr.name, HELPERS_DB_CONNECTION)
    private districtTrModel: Model<DistrictTrDocument>,
  ) {}

  async findCountries() {
    return this.countryModel
      .find()
      .select("id name nativeName alpha2Code alpha3Code capital callingCodes flag")
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findCitiesTr() {
    return this.cityTrModel
      .find()
      .select("id name")
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findTownsTr(cityId: number) {
    return this.townTrModel
      .find({ cityId })
      .select("id cityId code name")
      .sort({ name: 1 })
      .lean()
      .exec();
  }

  async findDistrictsTr(cityId: number, townId?: number) {
    const query: Record<string, number> = { city_id: cityId };
    if (townId !== undefined) {
      query.id = townId;
    }

    return this.districtTrModel
      .find(query)
      .select("id city_id town county zipcode")
      .sort({ county: 1 })
      .lean()
      .exec();
  }
}
