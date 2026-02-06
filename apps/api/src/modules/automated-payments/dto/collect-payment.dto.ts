import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export enum CollectMode {
  ITEM = "item",
  BALANCE = "balance",
  CUSTOM = "custom",
}

export class CollectPaymentDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CollectMode)
  mode?: CollectMode = CollectMode.CUSTOM;

  @IsOptional()
  @IsString()
  paymentPlanId?: string;
}
