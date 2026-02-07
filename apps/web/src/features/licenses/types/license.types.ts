// Lisans tipleri
export type LicenseType = "kerzz-pos" | "orwi-pos" | "kerzz-cloud";
export type CompanyType = "chain" | "single" | "belediye" | "unv";
export type LicenseCategory =
  | "contact-ok"
  | "closed"
  | "no-software"
  | "different-software"
  | "seasoned"
  | "no-contract"
  | "offered"
  | "reseller-customer"
  | "demo"
  | "internal"
  | "standy";

// Alt tipler
export interface Address {
  address: string;
  cityId: number;
  city: string;
  townId: number;
  town: string;
  countryId: string;
  country: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  gsm: string;
}

export interface LicenseItem {
  id: string;
  moduleId: string;
  name: string;
  qty: number;
  subItems?: unknown[];
}

export interface OrwiStore {
  id: string;
  name: string;
  cloudId: string;
}

// Ana lisans tipi
export interface License {
  _id: string;
  id: string;
  no: number;
  creation: string;
  customerId: string;
  customerName: string;
  brandName: string;
  address: Address;
  phone: string;
  email: string;
  chainId: string;
  resellerId: string;
  persons: Person[];
  person: string;
  block: boolean;
  blockMessage: string;
  isOpen: boolean;
  active: boolean;
  saasItems: LicenseItem[];
  licenseItems: LicenseItem[];
  licenseId: number;
  lastOnline: string | null;
  lastIp: string;
  lastVersion: string;
  assetCode: number;
  hasRenty: boolean;
  hasLicense: boolean;
  haveContract: boolean;
  hasBoss: boolean;
  hasEftPos: boolean | null;
  type: LicenseType;
  currentVersion: string;
  orwiStore: OrwiStore;
  SearchItem: string;
  companyType: CompanyType;
  kitchenType: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// Query parametreleri
export interface LicenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: LicenseType | "";
  companyType?: CompanyType | "";
  category?: LicenseCategory | "";
  active?: boolean;
  block?: boolean;
  haveContract?: boolean;
  customerId?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  fields?: string[];
}

// Sayfa bilgisi
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Sayım bilgisi
export interface LicenseCounts {
  total: number;
  active: number;
  blocked: number;
  withContract: number;
  byType: {
    kerzzPos: number;
    orwiPos: number;
    kerzzCloud: number;
  };
  byCompanyType: {
    chain: number;
    single: number;
    belediye: number;
    unv: number;
  };
}

// API response
export interface LicensesResponse {
  data: License[];
  pagination: PaginationInfo;
  counts?: LicenseCounts;
}

// Form için input tipleri
export interface CreateLicenseInput {
  brandName: string;
  customerId?: string;
  customerName?: string;
  address?: Partial<Address>;
  phone?: string;
  email?: string;
  chainId?: string;
  resellerId?: string;
  persons?: Person[];
  person?: string;
  block?: boolean;
  blockMessage?: string;
  isOpen?: boolean;
  active?: boolean;
  saasItems?: LicenseItem[];
  licenseItems?: LicenseItem[];
  hasRenty?: boolean;
  hasLicense?: boolean;
  hasBoss?: boolean;
  hasEftPos?: boolean | null;
  type?: LicenseType;
  orwiStore?: Partial<OrwiStore>;
  companyType?: CompanyType;
  kitchenType?: string;
  category?: string;
}

export interface UpdateLicenseInput extends Partial<CreateLicenseInput> {}
