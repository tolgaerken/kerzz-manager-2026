import { IsString, IsOptional, IsBoolean, IsIn, ValidateNested, IsArray } from "class-validator";
import { Type } from "class-transformer";
import { CustomerAddressInputDto, ErpMappingInputDto } from "./create-customer.dto";

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @IsIn(["prospect", "customer"])
  type?: string;

  @IsString()
  @IsOptional()
  taxNo?: string;

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
  enabled?: boolean;

  @IsString()
  @IsOptional()
  segmentId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErpMappingInputDto)
  erpMappings?: ErpMappingInputDto[];
}
