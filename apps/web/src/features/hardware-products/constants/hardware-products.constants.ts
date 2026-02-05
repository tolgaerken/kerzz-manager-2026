export const HARDWARE_PRODUCTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    HARDWARE_PRODUCTS: "/hardware-products"
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100, 200]
};

// Para birimleri
export const CURRENCIES = [
  { id: "usd", name: "USD" },
  { id: "eur", name: "EUR" },
  { id: "try", name: "TRY" }
] as const;

// Birimler
export const UNITS = [
  { id: "AD", name: "Adet" },
  { id: "KG", name: "Kilogram" },
  { id: "MT", name: "Metre" },
  { id: "LT", name: "Litre" }
] as const;

// Helper functions
export const getCurrencyName = (currency: string): string => {
  const found = CURRENCIES.find((c) => c.id === currency);
  return found?.name || currency.toUpperCase();
};

export const getUnitName = (unit: string): string => {
  const found = UNITS.find((u) => u.id === unit);
  return found?.name || unit;
};
