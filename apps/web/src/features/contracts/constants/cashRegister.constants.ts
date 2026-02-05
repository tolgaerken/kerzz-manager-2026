// Yazarkasa Tür Sabitleri
export const CASH_REGISTER_TYPES = [
  { id: "tsm", name: "TSM" },
  { id: "gmp", name: "GMP" }
] as const;

export type CashRegisterType = (typeof CASH_REGISTER_TYPES)[number]["id"];

// Para Birimi Sabitleri
export const CURRENCY_OPTIONS = [
  { id: "tl", name: "TL" },
  { id: "usd", name: "USD" },
  { id: "eur", name: "EUR" }
] as const;

export type CurrencyType = (typeof CURRENCY_OPTIONS)[number]["id"];

// Destek Türü Sabitleri
export const SUPPORT_TYPES = [
  { id: "standart", name: "Standart" },
  { id: "gold", name: "Gold" },
  { id: "platin", name: "Platin" },
  { id: "vic", name: "VIC" }
] as const;

export type SupportType = (typeof SUPPORT_TYPES)[number]["id"];
