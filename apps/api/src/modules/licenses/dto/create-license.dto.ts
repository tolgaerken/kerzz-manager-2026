import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";

export class AddressInputDto {
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

export class PersonInputDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  gsm?: string;
}

export class LicenseItemInputDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  qty?: number;

  @IsOptional()
  @IsArray()
  subItems?: any[];
}

export class OrwiStoreInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  cloudId?: string;
}

export class CreateLicenseDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsString()
  brandName: string;

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
  type?: string; // 'kerzz-pos' | 'orwi-pos' | 'kerzz-cloud'

  @IsOptional()
  @ValidateNested()
  @Type(() => OrwiStoreInputDto)
  orwiStore?: OrwiStoreInputDto;

  @IsOptional()
  @IsString()
  companyType?: string; // 'chain' | 'single' | 'belediye' | 'unv'

  @IsOptional()
  @IsString()
  kitchenType?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
