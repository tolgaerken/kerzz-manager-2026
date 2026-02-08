import { Controller, Get, Query } from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { TownQueryDto, DistrictQueryDto } from "./dto";

@Controller("locations")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get("countries")
  findCountries() {
    return this.locationsService.findCountries();
  }

  @Get("cities-tr")
  findCitiesTr() {
    return this.locationsService.findCitiesTr();
  }

  @Get("towns-tr")
  findTownsTr(@Query() query: TownQueryDto) {
    return this.locationsService.findTownsTr(query.cityId);
  }

  @Get("districts-tr")
  findDistrictsTr(@Query() query: DistrictQueryDto) {
    return this.locationsService.findDistrictsTr(query.cityId, query.townId);
  }
}
