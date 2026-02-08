import { IsNumber, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class TownQueryDto {
  @Type(() => Number)
  @IsNumber()
  cityId: number;
}

export class DistrictQueryDto {
  @Type(() => Number)
  @IsNumber()
  cityId: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  townId?: number;
}
