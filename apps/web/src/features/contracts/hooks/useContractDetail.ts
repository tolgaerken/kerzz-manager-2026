import { useQuery } from "@tanstack/react-query";
import {
  fetchContractUsers,
  fetchContractSupports,
  fetchContractSupportStats,
  fetchContractSaas,
  fetchContractSaasStats,
  fetchContractCashRegisters,
  fetchContractCashRegisterStats,
  fetchContractVersions,
  fetchContractItems,
  fetchContractDocuments,
  fetchContractPayments
} from "../api/contractDetailApi";

export function useContractUsers(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-users", contractId],
    queryFn: () => fetchContractUsers(contractId!),
    enabled: !!contractId
  });
}

export function useContractSupports(contractId?: string, fetchAll = false) {
  return useQuery({
    queryKey: ["contract-supports", contractId ?? "all"],
    queryFn: () => fetchContractSupports({ contractId }),
    enabled: !!contractId || fetchAll
  });
}

export function useContractSupportStats(contractId?: string) {
  return useQuery({
    queryKey: ["contract-support-stats", contractId ?? "all"],
    queryFn: () => fetchContractSupportStats(contractId),
    staleTime: 1000 * 60 * 5 // 5 dakika cache
  });
}

export function useContractSaas(contractId?: string, fetchAll = false) {
  return useQuery({
    queryKey: ["contract-saas", contractId ?? "all"],
    queryFn: () => fetchContractSaas({ contractId }),
    enabled: !!contractId || fetchAll
  });
}

export function useContractSaasStats(contractId?: string) {
  return useQuery({
    queryKey: ["contract-saas-stats", contractId ?? "all"],
    queryFn: () => fetchContractSaasStats(contractId),
    staleTime: 1000 * 60 * 5 // 5 dakika cache
  });
}

export function useContractCashRegisters(contractId?: string, fetchAll = false) {
  return useQuery({
    queryKey: ["contract-cash-registers", contractId ?? "all"],
    queryFn: () => fetchContractCashRegisters({ contractId }),
    enabled: !!contractId || fetchAll
  });
}

export function useContractVersions(contractId?: string, fetchAll = false) {
  return useQuery({
    queryKey: ["contract-versions", contractId ?? "all"],
    queryFn: () => fetchContractVersions(contractId),
    enabled: !!contractId || fetchAll
  });
}

export function useContractItems(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-items", contractId],
    queryFn: () => fetchContractItems(contractId!),
    enabled: !!contractId
  });
}

export function useContractDocuments(contractId?: string, fetchAll = false) {
  return useQuery({
    queryKey: ["contract-documents", contractId ?? "all"],
    queryFn: () => fetchContractDocuments(contractId),
    enabled: !!contractId || fetchAll
  });
}

export function useContractPayments(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-payments", contractId],
    queryFn: () => fetchContractPayments(contractId!),
    enabled: !!contractId
  });
}

export function useContractCashRegisterStats(contractId?: string) {
  return useQuery({
    queryKey: ["contract-cash-register-stats", contractId ?? "all"],
    queryFn: () => fetchContractCashRegisterStats(contractId),
    staleTime: 1000 * 60 * 5 // 5 dakika cache
  });
}
