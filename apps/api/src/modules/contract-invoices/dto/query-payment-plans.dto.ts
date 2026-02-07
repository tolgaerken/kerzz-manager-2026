import { IsString, IsDateString, IsOptional } from "class-validator";

export class QueryPaymentPlansDto {
  /** Donem tipi: "monthly" veya "yearly" */
  @IsString()
  period: string;

  /** Hedef ay (ISO format: YYYY-MM-DD) */
  @IsDateString()
  date: string;

  /** Arama metni (opsiyonel) */
  @IsOptional()
  @IsString()
  search?: string;
}
