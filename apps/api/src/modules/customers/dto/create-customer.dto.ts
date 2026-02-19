import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsIn,
  ValidateNested,
  ValidateIf,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class ErpMappingInputDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  erpId: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CustomerAddressInputDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  cityId?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  townId?: number;

  @IsOptional()
  @IsString()
  town?: string;

  @IsOptional()
  @IsNumber()
  districtId?: number;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  countryId?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateCustomerDto {
  @IsOptional()
  @IsString()
  @IsIn(["prospect", "customer"])
  type?: string = "customer";

  @ValidateIf((o) => o.type !== "prospect")
  @IsString()
  @IsNotEmpty({ message: "Vergi numarası zorunludur" })
  taxNo: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerAddressInputDto)
  address?: CustomerAddressInputDto;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsString()
  @IsOptional()
  segmentId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErpMappingInputDto)
  erpMappings?: ErpMappingInputDto[];
}
