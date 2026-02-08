import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsDateString,
  IsIn,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { OfferMailRecipientDto } from "./create-offer.dto";

export class UpdateOfferDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  customerName?: string;

  @IsDateString()
  @IsOptional()
  offerDate?: string;

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  sellerId?: string;

  @IsString()
  @IsOptional()
  sellerName?: string;

  @IsNumber()
  @IsOptional()
  usdRate?: number;

  @IsNumber()
  @IsOptional()
  eurRate?: number;

  @IsString()
  @IsOptional()
  @IsIn([
    "draft", "sent", "revised", "waiting",
    "approved", "rejected", "won", "lost", "converted",
  ])
  status?: string;

  @IsString()
  @IsOptional()
  offerNote?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OfferMailRecipientDto)
  mailList?: OfferMailRecipientDto[];

  @IsArray()
  @IsOptional()
  labels?: string[];

  @IsString()
  @IsOptional()
  internalFirm?: string;

  // Dual write
  @IsArray()
  @IsOptional()
  products?: any[];

  @IsArray()
  @IsOptional()
  licenses?: any[];

  @IsArray()
  @IsOptional()
  rentals?: any[];

  @IsArray()
  @IsOptional()
  payments?: any[];
}
