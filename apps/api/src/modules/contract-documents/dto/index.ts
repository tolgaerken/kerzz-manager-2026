import { IsOptional, IsString, IsDateString } from "class-validator";

export class ContractDocumentQueryDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class ContractDocumentResponseDto {
  _id: string;
  id: string;
  contractId: string;
  description: string;
  filename: string;
  type: string;
  documentDate: Date;
  userId: string;
  saleId: string;
  offerId: string;
  customerId: string;
  licanceId: string;
  documentVersion: string;
  editDate: Date;
  editUser: string;
}

export class ContractDocumentsListResponseDto {
  data: ContractDocumentResponseDto[];
  total: number;
}

export class CreateContractDocumentDto {
  @IsString()
  contractId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  saleId?: string;

  @IsOptional()
  @IsString()
  offerId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  licanceId?: string;

  @IsOptional()
  @IsString()
  documentVersion?: string;
}

export class UpdateContractDocumentDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  filename?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsOptional()
  @IsString()
  documentVersion?: string;
}
