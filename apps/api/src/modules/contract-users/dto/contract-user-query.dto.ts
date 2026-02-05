import { IsOptional, IsString } from "class-validator";

export class ContractUserQueryDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  role?: string;
}
