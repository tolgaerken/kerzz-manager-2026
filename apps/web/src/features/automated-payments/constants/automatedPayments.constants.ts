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
};
