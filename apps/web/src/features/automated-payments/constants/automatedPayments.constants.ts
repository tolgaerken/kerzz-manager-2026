export const AUTOMATED_PAYMENTS_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3888/api",
  ENDPOINTS: {
    TOKENS: "/automated-payments/tokens",
    COLLECT: "/automated-payments/collect",
    CUSTOMER_CARDS: (customerId: string) =>
      `/automated-payments/tokens/${customerId}/cards`,
    PAYMENT_PLANS: (erpId: string) =>
      `/automated-payments/payment-plans/${erpId}`,
    DELETE_TOKEN: (id: string) => `/automated-payments/tokens/${id}`,
    DELETE_CARD: (customerId: string, ctoken: string) =>
      `/automated-payments/cards/${customerId}/${ctoken}`,
  },
  DEFAULT_PAGE_SIZE: 50,
  PAGE_SIZE_OPTIONS: [25, 50, 100] as const,
  COMPANY_OPTIONS: [
    { id: "VERI", name: "Veri" },
    { id: "CLOUD", name: "Cloud" },
    { id: "BTT", name: "BTT" },
    { id: "ETYA", name: "Etya" },
    { id: "MARKAMUTFAGI", name: "Marka Mutfağı" },
  ] as const,
};
