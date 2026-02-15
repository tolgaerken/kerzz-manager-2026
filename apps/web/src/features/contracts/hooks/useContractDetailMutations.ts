import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createContractUser,
  updateContractUser,
  deleteContractUser,
  createContractSupport,
  updateContractSupport,
  deleteContractSupport,
  activateContractSupport,
  createContractSaas,
  updateContractSaas,
  deleteContractSaas,
  activateContractSaas,
  createContractCashRegister,
  updateContractCashRegister,
  deleteContractCashRegister,
  activateContractCashRegister,
  createContractVersion,
  updateContractVersion,
  deleteContractVersion,
  activateContractVersion,
  createContractItem,
  updateContractItem,
  deleteContractItem,
  activateContractItem,
  createContractDocument,
  updateContractDocument,
  deleteContractDocument,
  createContractPayment,
  updateContractPayment,
  deleteContractPayment
} from "../api/contractDetailApi";
import type {
  ContractUser,
  ContractSupport,
  ContractSaas,
  ContractCashRegister,
  ContractVersion,
  ContractItem,
  ContractDocument,
  ContractPayment
} from "../types";

// Contract Users Mutations
export function useCreateContractUser(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractUser, "_id" | "id">) => createContractUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-users", contractId] });
    }
  });
}

export function useUpdateContractUser(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractUser, "_id" | "id">> }) =>
      updateContractUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-users", contractId] });
    }
  });
}

export function useDeleteContractUser(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-users", contractId] });
    }
  });
}

// Contract Supports Mutations
export function useCreateContractSupport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractSupport, "_id" | "id">) => createContractSupport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-supports", contractId] });
    }
  });
}

export function useUpdateContractSupport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractSupport, "_id" | "id">> }) =>
      updateContractSupport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-supports", contractId] });
    }
  });
}

export function useDeleteContractSupport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractSupport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-supports", contractId] });
    }
  });
}

export function useActivateContractSupport(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateContractSupport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-supports", contractId] });
    }
  });
}

// Contract Saas Mutations
export function useCreateContractSaas(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractSaas, "_id" | "id">) => createContractSaas(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-saas", contractId] });
    }
  });
}

export function useUpdateContractSaas(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractSaas, "_id" | "id">> }) =>
      updateContractSaas(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-saas", contractId] });
    }
  });
}

export function useDeleteContractSaas(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractSaas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-saas", contractId] });
    }
  });
}

export function useActivateContractSaas(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateContractSaas(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-saas", contractId] });
    }
  });
}

// Contract Cash Registers Mutations
export function useCreateContractCashRegister(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractCashRegister, "_id" | "id">) => createContractCashRegister(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-cash-registers", contractId] });
    }
  });
}

export function useUpdateContractCashRegister(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string;
      data: Partial<Omit<ContractCashRegister, "_id" | "id">>;
    }) => updateContractCashRegister(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-cash-registers", contractId] });
    }
  });
}

export function useDeleteContractCashRegister(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractCashRegister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-cash-registers", contractId] });
    }
  });
}

export function useActivateContractCashRegister(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateContractCashRegister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-cash-registers", contractId] });
    }
  });
}

// Contract Versions Mutations
export function useCreateContractVersion(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractVersion, "_id" | "id">) => createContractVersion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-versions", contractId] });
    }
  });
}

export function useUpdateContractVersion(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractVersion, "_id" | "id">> }) =>
      updateContractVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-versions", contractId] });
    }
  });
}

export function useDeleteContractVersion(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-versions", contractId] });
    }
  });
}

export function useActivateContractVersion(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateContractVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-versions", contractId] });
    }
  });
}

// Contract Items Mutations
export function useCreateContractItem(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractItem, "_id" | "id">) => createContractItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-items", contractId] });
    }
  });
}

export function useUpdateContractItem(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractItem, "_id" | "id">> }) =>
      updateContractItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-items", contractId] });
    }
  });
}

export function useDeleteContractItem(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-items", contractId] });
    }
  });
}

export function useActivateContractItem(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateContractItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-items", contractId] });
    }
  });
}

// Contract Documents Mutations
export function useCreateContractDocument(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractDocument, "_id" | "id">) => createContractDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-documents", contractId] });
    }
  });
}

export function useUpdateContractDocument(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractDocument, "_id" | "id">> }) =>
      updateContractDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-documents", contractId] });
    }
  });
}

export function useDeleteContractDocument(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-documents", contractId] });
    }
  });
}

// Contract Payments Mutations
export function useCreateContractPayment(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContractPayment, "_id" | "id">) => createContractPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-payments", contractId] });
    }
  });
}

export function useUpdateContractPayment(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<ContractPayment, "_id" | "id">> }) =>
      updateContractPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-payments", contractId] });
    }
  });
}

export function useDeleteContractPayment(contractId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContractPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-payments", contractId] });
    }
  });
}
