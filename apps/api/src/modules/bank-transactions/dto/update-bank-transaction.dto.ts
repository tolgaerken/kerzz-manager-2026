import { IsOptional, IsString, IsIn } from "class-validator";

export class UpdateBankTransactionDto {
  @IsOptional()
  @IsString()
  erpAccountCode?: string;

  @IsOptional()
  @IsString()
  erpGlAccountCode?: string;

  @IsOptional()
  @IsString()
  @IsIn(["waiting", "error", "success", "manual"])
  erpStatus?: string;

  @IsOptional()
  @IsString()
  erpMessage?: string;
}
