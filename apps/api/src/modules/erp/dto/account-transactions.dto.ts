import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class AccountsQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsString()
  company: string;
}

export class TransactionsQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsString()
  company: string;
}

export class DocumentDetailQueryDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsNotEmpty()
  @IsString()
  company: string;
}
