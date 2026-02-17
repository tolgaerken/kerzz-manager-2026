import type { EnrichedPaymentPlan } from "../types";

const PRORATED_DESCRIPTION_PATTERN = /(kıst|kist|prorat|prorated)/i;

/**
 * Ödeme planındaki satır açıklamalarında kıst/prorated ifade geçiyorsa true döner.
 */
export function hasProratedFee(plan: EnrichedPaymentPlan): boolean {
  if (plan.type === "prorated") {
    return true;
  }

  if (!Array.isArray(plan.list) || plan.list.length === 0) {
    return false;
  }

  return plan.list.some((item) =>
    PRORATED_DESCRIPTION_PATTERN.test(item.description ?? ""),
  );
}
