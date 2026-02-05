import { IsString, IsOptional, IsBoolean, IsNotEmpty } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty({ message: "Vergi numarası zorunludur" })
  taxNo: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  district?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;
}
