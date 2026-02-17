import { IsArray, IsString, ArrayMinSize, IsBoolean, IsOptional } from "class-validator";

export class CreateInvoicesDto {
  /** Fatura olusturulacak odeme plani ID'leri */
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  planIds: string[];

  /**
   * Ayni cariye ait planlari tek faturada birlestir.
   * true ise ayni customerId + ayni ay icin olan planlar tek fatura olur.
   */
  @IsOptional()
  @IsBoolean()
  merge?: boolean;
}
