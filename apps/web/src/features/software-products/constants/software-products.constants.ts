export const SOFTWARE_PRODUCTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    SOFTWARE_PRODUCTS: "/software-products"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
};

// Ürün tipleri
export const PRODUCT_TYPES = [
  { id: "module", name: "Modül" },
  { id: "license", name: "Lisans" },
  { id: "service", name: "Servis" },
  { id: "addon", name: "Eklenti" }
] as const;

// Para birimleri
export const CURRENCIES = [
  { id: "usd", name: "USD" },
  { id: "eur", name: "EUR" },
  { id: "try", name: "TRY" }
] as const;

// Birimler
export const UNITS = [
  { id: "AD", name: "Adet" },
  { id: "AY", name: "Aylık" },
  { id: "YIL", name: "Yıllık" }
] as const;

// Helper functions
export const getProductTypeName = (type: string): string => {
  const found = PRODUCT_TYPES.find((t) => t.id === type);
  return found?.name || type;
};

export const getCurrencyName = (currency: string): string => {
  const found = CURRENCIES.find((c) => c.id === currency);
  return found?.name || currency.toUpperCase();
};

export const getUnitName = (unit: string): string => {
  const found = UNITS.find((u) => u.id === unit);
  return found?.name || unit;
};
