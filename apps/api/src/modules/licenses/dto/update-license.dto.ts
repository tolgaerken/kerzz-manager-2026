import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AddressInputDto,
  PersonInputDto,
  LicenseItemInputDto,
  OrwiStoreInputDto
} from "./create-license.dto";

// UpdateLicenseDto - tüm alanlar opsiyonel
export class UpdateLicenseDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  brandName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInputDto)
  address?: AddressInputDto;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  chainId?: string;

  @IsOptional()
  @IsString()
  resellerId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonInputDto)
  persons?: PersonInputDto[];

  @IsOptional()
  @IsString()
  person?: string;

  @IsOptional()
  @IsBoolean()
  block?: boolean;

  @IsOptional()
  @IsString()
  blockMessage?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LicenseItemInputDto)
  saasItems?: LicenseItemInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LicenseItemInputDto)
  licenseItems?: LicenseItemInputDto[];

  @IsOptional()
  @IsBoolean()
  hasRenty?: boolean;

  @IsOptional()
  @IsBoolean()
  hasLicense?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBoss?: boolean;

  @IsOptional()
  @IsBoolean()
  hasEftPos?: boolean | null;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrwiStoreInputDto)
  orwiStore?: OrwiStoreInputDto;

  @IsOptional()
  @IsString()
  companyType?: string;

  @IsOptional()
  @IsString()
  kitchenType?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
