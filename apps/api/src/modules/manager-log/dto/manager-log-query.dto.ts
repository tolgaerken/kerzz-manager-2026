import { IsString, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

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
