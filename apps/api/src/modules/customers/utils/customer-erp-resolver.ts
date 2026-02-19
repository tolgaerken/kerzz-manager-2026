import type { Customer, ErpMapping } from "../schemas/customer.schema";

export interface ErpResolverContext {
  companyId?: string;
  internalFirm?: string;
}

export interface ResolvedErpId {
  erpId: string;
  source: "legacy" | "mapping" | "primary" | "first" | "empty";
}

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
  customer: Pick<Customer, "erpId" | "erpMappings"> | null | undefined,
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
  customer: Pick<Customer, "erpId" | "erpMappings"> | null | undefined,
  context?: ErpResolverContext
): string {
  return resolveCustomerErpId(customer, context).erpId;
}

/**
 * Belirli bir firma için mapping'i bulur.
 * Yoksa undefined döner.
 */
export function findErpMappingByCompany(
  mappings: ErpMapping[] | undefined,
  companyId: string
): ErpMapping | undefined {
  if (!mappings || !companyId) return undefined;
  return mappings.find(
    (m) => m.companyId.toLowerCase() === companyId.toLowerCase()
  );
}

/**
 * Müşterinin belirli bir firma için ERP kodu olup olmadığını kontrol eder.
 * Legacy erpId veya mapping'de olabilir.
 */
export function hasErpIdForCompany(
  customer: Pick<Customer, "erpId" | "erpMappings"> | null | undefined,
  companyId?: string
): boolean {
  if (!customer) return false;

  // Legacy erpId varsa her firma için geçerli sayılır
  if (customer.erpId && customer.erpId.trim()) {
    return true;
  }

  // Firma belirtilmişse mapping'de ara
  if (companyId) {
    const mapping = findErpMappingByCompany(customer.erpMappings, companyId);
    return !!(mapping && mapping.erpId);
  }

  // Firma belirtilmemişse herhangi bir mapping yeterli
  return (customer.erpMappings || []).some((m) => m.erpId && m.erpId.trim());
}
