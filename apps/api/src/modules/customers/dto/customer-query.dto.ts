import { IsOptional, IsNumber, IsString, IsArray, IsBoolean, Min, IsIn } from "class-validator";
import { Type, Transform } from "class-transformer";

export class CustomerQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(["prospect", "customer", "all"])
  type?: string = "customer";

  @IsOptional()
  @IsString()
  sortField?: string = "name";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "asc";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === "string" ? value.split(",") : value))
  fields?: string[];

  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  activeContractsOnly?: boolean;
}
