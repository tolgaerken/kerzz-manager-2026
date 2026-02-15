import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type EmployeeProfileDocument = EmployeeProfile & Document;

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
 * Cinsiyet enum (opsiyonel)
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
@Schema({ _id: false })
export class EmergencyContact {
  @Prop({ default: "" })
  name: string;

  @Prop({ default: "" })
  phone: string;

  @Prop({ default: "" })
  relationship: string;
}

/**
 * Adres bilgileri
 */
@Schema({ _id: false })
export class EmployeeAddress {
  @Prop({ default: "" })
  street: string;

  @Prop({ default: "" })
  city: string;

  @Prop({ default: "" })
  district: string;

  @Prop({ default: "" })
  postalCode: string;

  @Prop({ default: "" })
  country: string;
}

/**
 * Çalışan Profili Şeması
 * SsoUser ile userId üzerinden ilişkilendirilir
 */
@Schema({ collection: "employee_profiles", timestamps: true })
export class EmployeeProfile {
  _id: Types.ObjectId;

  /**
   * SsoUser.id ile eşleşen kullanıcı kimliği
   * NOT: ObjectId değil, SsoUser'ın id alanı (string)
   */
  @Prop({ required: true, unique: true, index: true })
  userId: string;

  // ==================== ORGANİZASYON BİLGİLERİ ====================

  /** Personel numarası */
  @Prop({ default: "" })
  employeeNumber: string;

  /** Departman kodu */
  @Prop({ default: "", index: true })
  departmentCode: string;

  /** Departman adı */
  @Prop({ default: "" })
  departmentName: string;

  /** Unvan kodu */
  @Prop({ default: "", index: true })
  titleCode: string;

  /** Unvan adı */
  @Prop({ default: "" })
  titleName: string;

  /** Yönetici kullanıcı ID'si (SsoUser.id) */
  @Prop({ default: "", index: true })
  managerUserId: string;

  /** Lokasyon/Şube */
  @Prop({ default: "" })
  location: string;

  /** Çalışma tipi */
  @Prop({ type: String, enum: WorkType, default: WorkType.FULL_TIME })
  workType: WorkType;

  // ==================== ÖZLÜK BİLGİLERİ ====================

  /** TC Kimlik No / Ulusal Kimlik No (hassas alan) */
  @Prop({ default: "" })
  nationalId: string;

  /** Doğum tarihi */
  @Prop({ type: Date })
  birthDate?: Date;

  /** Cinsiyet (opsiyonel) */
  @Prop({ type: String, enum: Gender })
  gender?: Gender;

  /** Adres bilgileri */
  @Prop({ type: EmployeeAddress, default: () => ({}) })
  address: EmployeeAddress;

  /** Acil durum iletişim bilgileri */
  @Prop({ type: EmergencyContact, default: () => ({}) })
  emergencyContact: EmergencyContact;

  // ==================== İSTİHDAM BİLGİLERİ ====================

  /** İşe giriş tarihi */
  @Prop({ type: Date })
  hireDate?: Date;

  /** Sözleşme tipi */
  @Prop({ type: String, enum: ContractType, default: ContractType.PERMANENT })
  contractType: ContractType;

  /** Deneme süresi bitiş tarihi */
  @Prop({ type: Date })
  probationEndDate?: Date;

  /** Bordro grubu */
  @Prop({ default: "" })
  payrollGroup: string;

  /** Kıdem başlangıç tarihi */
  @Prop({ type: Date })
  seniorityStartDate?: Date;

  /** İstihdam durumu */
  @Prop({ type: String, enum: EmploymentStatus, default: EmploymentStatus.ACTIVE, index: true })
  employmentStatus: EmploymentStatus;

  /** İşten ayrılış tarihi */
  @Prop({ type: Date })
  terminationDate?: Date;

  /** İşten ayrılış nedeni */
  @Prop({ default: "" })
  terminationReason: string;

  // ==================== HASSAS ALANLAR (Restricted) ====================

  /** IBAN (hassas alan - field-level yetki gerektirir) */
  @Prop({ default: "" })
  iban: string;

  /** Maaş bilgisi (hassas alan - field-level yetki gerektirir) */
  @Prop({ type: Number })
  salary?: number;

  /** Maaş para birimi */
  @Prop({ default: "TRY" })
  salaryCurrency: string;

  // ==================== NOTLAR ====================

  /** Genel notlar (admin/İK tarafından görülebilir) */
  @Prop({ default: "" })
  notes: string;

  // ==================== AUDIT BİLGİLERİ ====================

  /** Kaydı oluşturan kullanıcı ID'si */
  @Prop()
  creatorId?: string;

  /** Son güncelleyen kullanıcı ID'si */
  @Prop()
  updaterId?: string;

  /** Oluşturulma tarihi (timestamps: true ile otomatik) */
  createdAt: Date;

  /** Güncellenme tarihi (timestamps: true ile otomatik) */
  updatedAt: Date;
}

export const EmployeeProfileSchema = SchemaFactory.createForClass(EmployeeProfile);

// Composite indexes for common queries
EmployeeProfileSchema.index({ departmentCode: 1, employmentStatus: 1 });
EmployeeProfileSchema.index({ managerUserId: 1, employmentStatus: 1 });
EmployeeProfileSchema.index({ titleCode: 1, employmentStatus: 1 });
EmployeeProfileSchema.index({ hireDate: 1 });
EmployeeProfileSchema.index({ employeeNumber: 1 });
