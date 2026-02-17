import { IsString, IsArray, IsOptional, ArrayMinSize } from "class-validator";

/**
 * Toplu onay isteği DTO'su
 */
export class RequestApprovalDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  saleIds: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * Tekil onay DTO'su
 */
export class ApproveSaleDto {
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * Tekil red DTO'su
 */
export class RejectSaleDto {
  @IsString()
  reason: string;
}

/**
 * Toplu onay DTO'su
 */
export class BulkApproveDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  saleIds: string[];

  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * Onay isteği sonuç DTO'su
 */
export class ApprovalRequestResultDto {
  success: boolean;
  updatedCount: number;
  saleIds: string[];
  message: string;
}

/**
 * Onay/Red işlem sonuç DTO'su
 */
export class ApprovalActionResultDto {
  success: boolean;
  saleId: string;
  action: "approved" | "rejected";
  message: string;
}
