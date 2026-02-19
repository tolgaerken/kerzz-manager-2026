import type { ErpMapping } from "../types/customer.types";
import type { ErpMappingMinimal } from "../../lookup/types/lookup.types";

export interface ErpResolverContext {
  companyId?: string;
  internalFirm?: string;
}

export interface ResolvedErpId {
  erpId: string;
  source: "legacy" | "mapping" | "primary" | "first" | "empty";
}

type CustomerLike = {
  erpId?: string;
  erpMappings?: ErpMapping[] | ErpMappingMinimal[];
} | null | undefined;

/**
 * Müşteri için ERP kodunu çözümler.
 *
 * Çözümleme öncelik sırası (legacy-first stratejisi):
 * 1. Legacy erpId alanı (varsa ve boş değilse)
 * 2. Context'teki companyId/internalFirm ile eşleşen mapping
 * 3. isPrimary=true olan mapping
 * 4. İlk geçerli mapping
 * 5. Boş string (hiçbiri yoksa)
 */
export function resolveCustomerErpId(
  customer: CustomerLike,
  context?: ErpResolverContext
): ResolvedErpId {
  if (!customer) {
    return { erpId: "", source: "empty" };
  }

  // 1. Legacy erpId (en yüksek öncelik)
  if (customer.erpId && customer.erpId.trim()) {
    return { erpId: customer.erpId, source: "legacy" };
  }

  const mappings = customer.erpMappings || [];
  if (mappings.length === 0) {
    return { erpId: "", source: "empty" };
  }

  // 2. Context ile eşleşen mapping
  const contextCompanyId = context?.companyId || context?.internalFirm;
  if (contextCompanyId) {
    const contextMatch = mappings.find(
      (m) => m.companyId.toLowerCase() === contextCompanyId.toLowerCase()
    );
    if (contextMatch && contextMatch.erpId) {
      return { erpId: contextMatch.erpId, source: "mapping" };
    }
  }

  // 3. Primary mapping
  const primaryMapping = mappings.find((m) => m.isPrimary && m.erpId);
  if (primaryMapping) {
    return { erpId: primaryMapping.erpId, source: "primary" };
  }

  // 4. İlk geçerli mapping
  const firstValid = mappings.find((m) => m.erpId && m.erpId.trim());
  if (firstValid) {
    return { erpId: firstValid.erpId, source: "first" };
  }

  return { erpId: "", source: "empty" };
}

/**
 * Basitleştirilmiş versiyon: sadece erpId string döner.
 */
export function getCustomerErpId(
  customer: CustomerLike,
  context?: ErpResolverContext
): string {
  return resolveCustomerErpId(customer, context).erpId;
}

/**
 * Müşterinin herhangi bir ERP kodu olup olmadığını kontrol eder.
 */
export function hasCustomerErpId(customer: CustomerLike): boolean {
  if (!customer) return false;

  if (customer.erpId && customer.erpId.trim()) {
    return true;
  }

  return (customer.erpMappings || []).some((m) => m.erpId && m.erpId.trim());
}
