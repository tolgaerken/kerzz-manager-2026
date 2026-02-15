import {
  IsString,
  IsOptional,
  IsEnum,
  IsDate,
  IsNumber,
  ValidateNested,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";
import {
  WorkType,
  ContractType,
  EmploymentStatus,
  Gender,
} from "../schemas/employee-profile.schema";
import { EmergencyContactDto, EmployeeAddressDto } from "./create-employee-profile.dto";

/**
 * Çalışan profili güncelleme DTO'su (Admin/İK - Tam Yetki)
 * Tüm alanları güncelleyebilir
 */
export class UpdateEmployeeProfileDto {
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

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  terminationDate?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  terminationReason?: string;

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

/**
 * Self-Service güncelleme DTO'su
 * Kullanıcı sadece kendi profilinin belirli alanlarını güncelleyebilir
 * 
 * İZİN VERİLEN ALANLAR (Self-Service Whitelist):
 * - address (adres bilgileri)
 * - emergencyContact (acil durum iletişim)
 * - iban (IBAN - kendi hesabı)
 * 
 * YASAK ALANLAR (Sadece Admin/İK):
 * - departmentCode, departmentName
 * - titleCode, titleName
 * - managerUserId
 * - workType
 * - employeeNumber
 * - location
 * - nationalId
 * - birthDate, gender
 * - hireDate, contractType, probationEndDate
 * - payrollGroup, seniorityStartDate
 * - employmentStatus, terminationDate, terminationReason
 * - salary, salaryCurrency
 * - notes
 */
export class UpdateSelfProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EmployeeAddressDto)
  address?: EmployeeAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact?: EmergencyContactDto;

  @IsOptional()
  @IsString()
  @MaxLength(34)
  iban?: string;
}

/**
 * Self-service için izin verilen alanlar listesi
 * Servis katmanında whitelist kontrolü için kullanılır
 */
export const SELF_SERVICE_ALLOWED_FIELDS = [
  "address",
  "emergencyContact",
  "iban",
] as const;

export type SelfServiceAllowedField = (typeof SELF_SERVICE_ALLOWED_FIELDS)[number];
