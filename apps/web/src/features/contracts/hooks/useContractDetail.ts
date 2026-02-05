import { useQuery } from "@tanstack/react-query";
import {
  fetchContractUsers,
  fetchContractSupports,
  fetchContractSaas,
  fetchContractCashRegisters,
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

export function useContractSupports(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-supports", contractId],
    queryFn: () => fetchContractSupports(contractId!),
    enabled: !!contractId
  });
}

export function useContractSaas(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-saas", contractId],
    queryFn: () => fetchContractSaas(contractId!),
    enabled: !!contractId
  });
}

export function useContractCashRegisters(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-cash-registers", contractId],
    queryFn: () => fetchContractCashRegisters(contractId!),
    enabled: !!contractId
  });
}

export function useContractVersions(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-versions", contractId],
    queryFn: () => fetchContractVersions(contractId!),
    enabled: !!contractId
  });
}

export function useContractItems(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-items", contractId],
    queryFn: () => fetchContractItems(contractId!),
    enabled: !!contractId
  });
}

export function useContractDocuments(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-documents", contractId],
    queryFn: () => fetchContractDocuments(contractId!),
    enabled: !!contractId
  });
}

export function useContractPayments(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contract-payments", contractId],
    queryFn: () => fetchContractPayments(contractId!),
    enabled: !!contractId
  });
}
