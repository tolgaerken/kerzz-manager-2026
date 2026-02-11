import { IsString, IsOptional, IsNumber, Min, IsBoolean } from "class-validator";
import { Transform, Type } from "class-transformer";

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
}

export class ManagerLogQueryDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  contextType?: string;

  @IsString()
  @IsOptional()
  contextId?: string;

  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  @IsOptional()
  includeLegacy?: boolean = true;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}
