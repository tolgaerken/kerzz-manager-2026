import { IsString, IsOptional, IsArray, IsBoolean } from "class-validator";

/**
 * Kerzz Boss lisans kullanıcısı - grid'de gösterilen zenginleştirilmiş veri
 */
export interface BossLicenseUserDto {
  id: string;
  app_id: string;
  user_id: string;
  user_name?: string;
  licance_id?: string;
  brand?: string;
  roles: string[];
  branchCodes?: string[];
  statusText?: string;
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
  // User bilgileri (join)
  mail?: string;
  phone?: string;
  lastLoginDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Şube bilgisi
 */
export interface BranchDto {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Lisans oluşturma/güncelleme DTO
 */
export class CreateBossLicenseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  user_id: string;

  @IsOptional()
  @IsString()
  user_name?: string;

  @IsString()
  licance_id: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  branchCodes?: string[];
}

/**
 * Lisans güncelleme DTO
 */
export class UpdateBossLicenseDto {
  @IsOptional()
  @IsString()
  user_name?: string;

  @IsOptional()
  @IsString()
  licance_id?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  branchCodes?: string[];

  @IsOptional()
  @IsString()
  statusText?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

/**
 * Şube yetkilerini güncelleme DTO
 */
export class UpdateBranchesDto {
  @IsArray()
  @IsString({ each: true })
  branchCodes: string[];
}

/**
 * Engelleme DTO
 */
export class BlockUserDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  paymentLink?: string;

  @IsOptional()
  @IsString()
  type?: "block" | "info";
}

/**
 * Bildirim gönderme DTO
 */
export class SendNotificationDto {
  @IsString()
  user_id: string;

  @IsOptional()
  @IsBoolean()
  sendSms?: boolean;

  @IsOptional()
  @IsBoolean()
  sendEmail?: boolean;

  @IsOptional()
  @IsString()
  customMessage?: string;
}

/**
 * Kullanıcı oluşturma/güncelleme DTO
 */
export class UpsertUserDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
