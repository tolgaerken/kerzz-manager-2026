/**
 * Çalışma tipi enum
 */
export enum WorkType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  HYBRID = "hybrid",
  REMOTE = "remote",
  CONTRACT = "contract",
}

/**
 * Sözleşme tipi enum
 */
export enum ContractType {
  PERMANENT = "permanent",
  TEMPORARY = "temporary",
  INTERN = "intern",
  FREELANCE = "freelance",
}

/**
 * İstihdam durumu enum
 */
export enum EmploymentStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ON_LEAVE = "on_leave",
  TERMINATED = "terminated",
}

/**
 * Cinsiyet enum
 */
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

/**
 * Acil durum iletişim bilgileri
 */
export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Adres bilgileri
 */
export interface EmployeeAddress {
  street: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
}

/**
 * Çalışan profili
 */
export interface EmployeeProfile {
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
  nationalId: string;
  birthDate?: string;
  gender?: Gender;
  address: EmployeeAddress;
  emergencyContact: EmergencyContact;

  // İstihdam bilgileri
  hireDate?: string;
  contractType?: ContractType;
  probationEndDate?: string;
  payrollGroup: string;
  seniorityStartDate?: string;
  employmentStatus: EmploymentStatus;
  terminationDate?: string;
  terminationReason: string;

  // Hassas alanlar
  iban?: string;
  salary?: number;
  salaryCurrency?: string;

  // Notlar
  notes: string;

  // Audit bilgileri
  creatorId?: string;
  updaterId?: string;
  createdAt?: string;
  updatedAt?: string;

  // SSO kullanıcı bilgileri (liste görünümünde)
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userIsActive?: boolean;
  hasProfile?: boolean;
}

/**
 * SSO kullanıcı bilgileriyle zenginleştirilmiş profil
 */
export interface EnrichedEmployeeProfile extends EmployeeProfile {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userIsActive?: boolean;
  hasProfile?: boolean;
}

/**
 * Pagination meta bilgileri
 */
export interface PaginationMeta {
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
export interface PaginatedEmployeeProfileResponse {
  data: EmployeeProfile[];
  meta: PaginationMeta;
}

/**
 * Profil sorgu parametreleri
 */
export interface EmployeeProfileQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentCode?: string;
  titleCode?: string;
  managerUserId?: string;
  location?: string;
  employmentStatus?: EmploymentStatus;
  workType?: WorkType;
  contractType?: ContractType;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Yeni profil oluşturma form verisi
 */
export interface CreateEmployeeProfileFormData {
  userId: string;
  employeeNumber?: string;
  departmentCode?: string;
  departmentName?: string;
  titleCode?: string;
  titleName?: string;
  managerUserId?: string;
  location?: string;
  workType?: WorkType;
  nationalId?: string;
  birthDate?: string;
  gender?: Gender;
  address?: Partial<EmployeeAddress>;
  emergencyContact?: Partial<EmergencyContact>;
  hireDate?: string;
  contractType?: ContractType;
  probationEndDate?: string;
  payrollGroup?: string;
  seniorityStartDate?: string;
  employmentStatus?: EmploymentStatus;
  iban?: string;
  salary?: number;
  salaryCurrency?: string;
  notes?: string;
}

/**
 * Profil güncelleme form verisi (Admin/İK)
 */
export interface UpdateEmployeeProfileFormData {
  employeeNumber?: string;
  departmentCode?: string;
  departmentName?: string;
  titleCode?: string;
  titleName?: string;
  managerUserId?: string;
  location?: string;
  workType?: WorkType;
  nationalId?: string;
  birthDate?: string;
  gender?: Gender;
  address?: Partial<EmployeeAddress>;
  emergencyContact?: Partial<EmergencyContact>;
  hireDate?: string;
  contractType?: ContractType;
  probationEndDate?: string;
  payrollGroup?: string;
  seniorityStartDate?: string;
  employmentStatus?: EmploymentStatus;
  terminationDate?: string;
  terminationReason?: string;
  iban?: string;
  salary?: number;
  salaryCurrency?: string;
  notes?: string;
}

/**
 * Self-service profil güncelleme form verisi
 */
export interface UpdateSelfProfileFormData {
  address?: Partial<EmployeeAddress>;
  emergencyContact?: Partial<EmergencyContact>;
  iban?: string;
}

/**
 * İstatistikler
 */
export interface EmployeeProfileStats {
  total: number;
  byStatus: Record<string, number>;
  byDepartment: { code: string; name: string; count: number }[];
}

/**
 * Toplu oluşturma sonucu
 */
export interface BulkCreateResult {
  created: number;
  skipped: number;
  errors: string[];
}

/**
 * Enum label çevirileri
 */
export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  [WorkType.FULL_TIME]: "Tam Zamanlı",
  [WorkType.PART_TIME]: "Yarı Zamanlı",
  [WorkType.HYBRID]: "Hibrit",
  [WorkType.REMOTE]: "Uzaktan",
  [WorkType.CONTRACT]: "Sözleşmeli",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  [ContractType.PERMANENT]: "Süresiz",
  [ContractType.TEMPORARY]: "Belirli Süreli",
  [ContractType.INTERN]: "Stajyer",
  [ContractType.FREELANCE]: "Serbest",
};

export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  [EmploymentStatus.ACTIVE]: "Aktif",
  [EmploymentStatus.INACTIVE]: "Pasif",
  [EmploymentStatus.ON_LEAVE]: "İzinli",
  [EmploymentStatus.TERMINATED]: "Ayrılmış",
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "Erkek",
  [Gender.FEMALE]: "Kadın",
  [Gender.OTHER]: "Diğer",
  [Gender.PREFER_NOT_TO_SAY]: "Belirtmek İstemiyorum",
};
