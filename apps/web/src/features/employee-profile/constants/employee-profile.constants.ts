import {
  WorkType,
  ContractType,
  EmploymentStatus,
  Gender,
  WORK_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  GENDER_LABELS,
} from "../types";

/**
 * Çalışma tipi seçenekleri
 */
export const WORK_TYPE_OPTIONS = Object.values(WorkType).map((value) => ({
  value,
  label: WORK_TYPE_LABELS[value],
}));

/**
 * Sözleşme tipi seçenekleri
 */
export const CONTRACT_TYPE_OPTIONS = Object.values(ContractType).map((value) => ({
  value,
  label: CONTRACT_TYPE_LABELS[value],
}));

/**
 * İstihdam durumu seçenekleri
 */
export const EMPLOYMENT_STATUS_OPTIONS = Object.values(EmploymentStatus).map((value) => ({
  value,
  label: EMPLOYMENT_STATUS_LABELS[value],
}));

/**
 * Cinsiyet seçenekleri
 */
export const GENDER_OPTIONS = Object.values(Gender).map((value) => ({
  value,
  label: GENDER_LABELS[value],
}));

/**
 * Self-service için düzenlenebilir alanlar
 */
export const SELF_SERVICE_EDITABLE_FIELDS = [
  "address.street",
  "address.city",
  "address.district",
  "address.postalCode",
  "address.country",
  "emergencyContact.name",
  "emergencyContact.phone",
  "emergencyContact.relationship",
  "iban",
] as const;

/**
 * Hassas alanlar (yetki kontrolü gerektirir)
 */
export const SENSITIVE_FIELDS = [
  "nationalId",
  "iban",
  "salary",
  "salaryCurrency",
] as const;

/**
 * Grid varsayılan sıralama
 */
export const DEFAULT_SORT = {
  field: "createdAt",
  order: "desc" as const,
};

/**
 * Grid varsayılan sayfa boyutu
 */
export const DEFAULT_PAGE_SIZE = 50;

/**
 * Grid sayfa boyutu seçenekleri
 */
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
