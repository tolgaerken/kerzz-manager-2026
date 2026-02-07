import { IsArray, IsString, ArrayMinSize } from "class-validator";

export class CreateInvoicesDto {
  /** Fatura olusturulacak odeme plani ID'leri */
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  planIds: string[];
}
