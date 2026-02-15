import {
  WorkType,
  ContractType,
  EmploymentStatus,
  Gender,
} from "../schemas/employee-profile.schema";

export class EmergencyContactResponseDto {
  name: string;
  phone: string;
  relationship: string;
}

export class EmployeeAddressResponseDto {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

/**
 * Çalışan profili response DTO'su
 */
export class EmployeeProfileResponseDto {
  _id: string;
  userId: string;

  // Organizasyon bilgileri
  employeeNumber: string;
  departmentCode: string;
  departmentName: string;
  titleCode: string;
  titleName: string;
  managerUserId: string;
  location: string;
  workType?: WorkType;

  // Özlük bilgileri
  nationalId: string; // Maskelenmiş olabilir
  birthDate?: Date;
  gender?: Gender;
  address: EmployeeAddressResponseDto;
  emergencyContact: EmergencyContactResponseDto;

  // İstihdam bilgileri
  hireDate?: Date;
  contractType?: ContractType;
  probationEndDate?: Date;
  payrollGroup: string;
  seniorityStartDate?: Date;
  employmentStatus: EmploymentStatus;
  terminationDate?: Date;
  terminationReason: string;

  // Hassas alanlar (yetki kontrolüne göre gösterilir)
  iban?: string;
  salary?: number;
  salaryCurrency?: string;

  // Notlar
  notes: string;

  // Audit bilgileri
  creatorId?: string;
  updaterId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Pagination meta bilgileri
 */
export class PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Sayfalanmış çalışan profili listesi response
 */
export class PaginatedEmployeeProfileResponseDto {
  data: EmployeeProfileResponseDto[];
  meta: PaginationMetaDto;
}

/**
 * SSO kullanıcı bilgileriyle zenginleştirilmiş profil response
 */
export class EnrichedEmployeeProfileResponseDto extends EmployeeProfileResponseDto {
  // SSO'dan gelen kullanıcı bilgileri
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userIsActive?: boolean;
  
  // Profil durumu (employee_profiles koleksiyonunda kayıt var mı)
  hasProfile?: boolean;
}

/**
 * Hassas alanları maskeleyen yardımcı fonksiyon
 * @param nationalId TC Kimlik No
 * @param showFull Tam gösterim yetkisi var mı
 */
export function maskNationalId(nationalId: string, showFull: boolean): string {
  if (!nationalId || nationalId.length === 0) return "";
  if (showFull) return nationalId;
  
  // İlk 3 ve son 2 karakteri göster, arasını maskele
  if (nationalId.length <= 5) return "*".repeat(nationalId.length);
  
  const start = nationalId.slice(0, 3);
  const end = nationalId.slice(-2);
  const middle = "*".repeat(nationalId.length - 5);
  
  return `${start}${middle}${end}`;
}

/**
 * IBAN maskeleyen yardımcı fonksiyon
 * @param iban IBAN numarası
 * @param showFull Tam gösterim yetkisi var mı
 */
export function maskIban(iban: string, showFull: boolean): string {
  if (!iban || iban.length === 0) return "";
  if (showFull) return iban;
  
  // Son 4 karakteri göster, geri kalanı maskele
  if (iban.length <= 4) return "*".repeat(iban.length);
  
  const visible = iban.slice(-4);
  const masked = "*".repeat(iban.length - 4);
  
  return `${masked}${visible}`;
}
