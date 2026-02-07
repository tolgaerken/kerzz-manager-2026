/**
 * E-Fatura sabitleri
 */
export const E_INVOICE_CONSTANTS = {
  /** Varsayılan KDV oranı (%) */
  DEFAULT_VAT_RATE: 20,

  /** Varsayılan KDV oranı (ondalık) */
  DEFAULT_VAT_RATE_DECIMAL: 0.20,

  /** E-belge fatura vade süresi (gün) */
  EDOC_DUE_DAYS: 10,

  /** Fatura kalem kodu */
  INVOICE_ITEM_CODE: "B006",

  /** Fatura birim adı */
  INVOICE_UNIT_NAME: "AD",
} as const;
