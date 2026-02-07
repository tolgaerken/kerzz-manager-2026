const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3888/api";

export const CONTRACT_INVOICES_CONSTANTS = {
  API_BASE_URL,
  ENDPOINTS: {
    PAYMENT_PLANS: "/contract-invoices/payment-plans",
    CREATE_INVOICES: "/contract-invoices/create",
    CHECK_CONTRACTS: "/contract-invoices/check-contracts",
  },

  /** Donem secenekleri */
  PERIOD_OPTIONS: [
    { id: "monthly", name: "Aylık Sözleşmeler" },
    { id: "yearly", name: "Yıllık Sözleşmeler" },
  ],
} as const;
