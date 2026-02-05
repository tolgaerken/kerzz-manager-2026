import { IsString, IsOptional, IsBoolean, IsNumber } from "class-validator";

export class CreateEftPosModelDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  editUser?: string;
}
