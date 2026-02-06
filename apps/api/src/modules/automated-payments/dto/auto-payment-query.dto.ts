import {
  IsOptional,
  IsString,
} from "class-validator";

export class AutoPaymentQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  sortField?: string = "createDate";

  @IsOptional()
  @IsString()
  sortOrder?: "asc" | "desc" = "desc";
}
