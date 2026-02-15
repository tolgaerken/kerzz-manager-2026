import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  ValidateNested,
  MaxLength,
  MinLength,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";
import {
  WorkType,
  ContractType,
  EmploymentStatus,
  Gender,
} from "../schemas/employee-profile.schema";

export class EmergencyContactDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  relationship?: string;
}

export class EmployeeAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  street?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}

/**
 * Yeni çalışan profili oluşturma DTO'su
 * Sadece Admin/İK tarafından kullanılabilir
 */
export class CreateEmployeeProfileDto {
  @IsString()
  @IsNotEmpty({ message: "Kullanıcı ID zorunludur" })
  userId: string;

  // ==================== ORGANİZASYON BİLGİLERİ ====================

  @IsOptional()
  @IsString()
  @MaxLength(50)
  employeeNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  departmentCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departmentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  titleCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  titleName?: string;

  @IsOptional()
  @IsString()
  managerUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsEnum(WorkType)
  workType?: WorkType;

  // ==================== ÖZLÜK BİLGİLERİ ====================

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nationalId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmployeeAddressDto)
  address?: EmployeeAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  // ==================== İSTİHDAM BİLGİLERİ ====================

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hireDate?: Date;

  @IsOptional()
  @IsEnum(ContractType)
  contractType?: ContractType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  probationEndDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payrollGroup?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  seniorityStartDate?: Date;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;

  // ==================== HASSAS ALANLAR ====================

  @IsOptional()
  @IsString()
  @MaxLength(34)
  iban?: string;

  @IsOptional()
  @IsNumber()
  salary?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  salaryCurrency?: string;

  // ==================== NOTLAR ====================

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
