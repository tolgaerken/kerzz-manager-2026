/**
 * Fatura için mevcut koşul kodunu türetir (overdueDays'e göre)
 * Backend'deki templateCodeBase mantığıyla aynı
 */
export function getCurrentInvoiceCondition(overdueDays: number): string {
  if (overdueDays <= 0) {
    return "invoice-due";
  }
  if (overdueDays <= 3) {
    return "invoice-overdue-3";
  }
  return "invoice-overdue-5";
}

/**
 * Kontrat için mevcut koşul kodunu döner (sabit)
 */
export function getCurrentContractCondition(): string {
  return "contract-expiry";
}

/**
 * sentConditions içinde mevcut koşulun herhangi bir kanalı var mı kontrol eder
 * Örn: currentCondition="invoice-due", sentConditions=["invoice-due-email"] -> true
 */
export function hasMatchingCondition(
  sentConditions: string[],
  currentCondition: string
): boolean {
  return sentConditions.some(
    (sc) => sc === `${currentCondition}-email` || sc === `${currentCondition}-sms`
  );
}

/**
 * Koşul kodunu Türkçe etikete çevirir
 */
export function getConditionLabel(conditionCode: string): string {
  const labels: Record<string, string> = {
    "invoice-due": "Vade Hatırlatma",
    "invoice-overdue-3": "Vadesi Geçmiş (≤3 gün)",
    "invoice-overdue-5": "Vadesi Geçmiş (>3 gün)",
    "contract-expiry": "Kontrat Süresi Dolumu",
  };
  return labels[conditionCode] ?? conditionCode;
}
