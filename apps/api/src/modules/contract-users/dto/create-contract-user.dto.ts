import { IsEmail, IsOptional, IsString } from "class-validator";

export class CreateContractUserDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  gsm?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;
}
