import { Type } from "class-transformer";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";

export class InflationRateQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc";
}

export class CreateInflationRateDto {
  @IsString()
  country: string;

  @Type(() => Number)
  @IsNumber()
  year: number;

  @Type(() => Number)
  @IsNumber()
  month: number;

  @IsDateString()
  date: string;

  @Type(() => Number)
  @IsNumber()
  consumer: number;

  @Type(() => Number)
  @IsNumber()
  producer: number;

  @Type(() => Number)
  @IsNumber()
  monthlyConsumer: number;

  @Type(() => Number)
  @IsNumber()
  monthlyProducer: number;
}

export class UpdateInflationRateDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  consumer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  producer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monthlyConsumer?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monthlyProducer?: number;
}

export class InflationRateResponseDto {
  _id: string;
  id: string;
  country: string;
  year: number;
  month: number;
  date: Date;
  consumer: number;
  producer: number;
  average: number;
  monthlyConsumer: number;
  monthlyProducer: number;
  monthlyAverage: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class InflationRatesListResponseDto {
  data: InflationRateResponseDto[];
  total: number;
}
