export const LICENSES_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    LICENSES: "/licenses"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
};

// Lisans tipleri
export const LICENSE_TYPES = [
  { id: "kerzz-pos", name: "Kerzz POS" },
  { id: "orwi-pos", name: "Orwi POS" },
  { id: "kerzz-cloud", name: "Kerzz Cloud" }
] as const;

// Şirket tipleri
export const COMPANY_TYPES = [
  { id: "chain", name: "Zincir" },
  { id: "single", name: "Tekil" },
  { id: "belediye", name: "Belediye" },
  { id: "unv", name: "Üniversite" }
] as const;

// Kategoriler
export const LICENSE_CATEGORIES = [
  { id: "contact-ok", name: "Kontratlı" },
  { id: "closed", name: "İşletme Kapalı" },
  { id: "no-software", name: "Program Kullanmıyor" },
  { id: "different-software", name: "Başka Program" },
  { id: "seasoned", name: "Sezonluk İşletme" },
  { id: "no-contract", name: "Kontrat Yapmıyor" },
  { id: "offered", name: "Teklif Verildi" },
  { id: "reseller-customer", name: "Çözüm Ortağı" },
  { id: "demo", name: "Demo" },
  { id: "internal", name: "İç Kullanım" },
  { id: "standy", name: "Oyalıyor" }
] as const;

// Tip label helpers
export const getTypeName = (type: string): string => {
  const found = LICENSE_TYPES.find((t) => t.id === type);
  return found?.name || type;
};

export const getCompanyTypeName = (type: string): string => {
  const found = COMPANY_TYPES.find((t) => t.id === type);
  return found?.name || type;
};

export const getCategoryName = (category: string): string => {
  const found = LICENSE_CATEGORIES.find((c) => c.id === category);
  return found?.name || category;
};
