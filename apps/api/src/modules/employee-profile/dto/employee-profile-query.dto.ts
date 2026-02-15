import { IsOptional, IsNumber, IsString, IsArray, Min, IsIn, IsEnum } from "class-validator";
import { Type, Transform } from "class-transformer";
import { EmploymentStatus, WorkType, ContractType } from "../schemas/employee-profile.schema";

export class EmployeeProfileQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  departmentCode?: string;

  @IsOptional()
  @IsString()
  titleCode?: string;

  @IsOptional()
  @IsString()
  managerUserId?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @IsString()
  sortField?: string = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === "string" ? value.split(",") : value))
  fields?: string[];
}
