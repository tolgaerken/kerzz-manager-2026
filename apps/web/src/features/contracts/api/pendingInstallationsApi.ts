import {
  fetchContractCashRegisters,
  fetchContractSaas,
  fetchContractSupports
} from "./contractDetailApi";
import { fetchContracts } from "./contractsApi";
import type {
  PendingInstallationItem,
  PendingInstallationsResponse,
  PendingInstallationType
} from "../types/pendingInstallation.types";
import type {
  ContractCashRegister,
  ContractSaas,
  ContractSupport,
  Contract
} from "../types";

/**
 * Tüm kurulum bekleyen ürünleri çeker ve birleştirir
 */
export async function fetchPendingInstallations(): Promise<PendingInstallationsResponse> {
  // Paralel olarak tüm verileri çek
  const [cashRegistersRes, saasRes, supportsRes, contractsRes] = await Promise.all([
    fetchContractCashRegisters({ activated: false }),
    fetchContractSaas({ activated: false }),
    fetchContractSupports({ activated: false }),
    fetchContracts({ flow: "all", limit: 99999 })
  ]);

  // Contract map oluştur (hızlı erişim için)
  const contractMap = new Map<string, Contract>();
  contractsRes.data.forEach((contract) => {
    contractMap.set(contract.contractId, contract);
  });

  // Cash registers'ı normalize et
  const cashRegisterItems: PendingInstallationItem[] = cashRegistersRes.data.map(
    (item: ContractCashRegister) => {
      const contract = contractMap.get(item.contractId);
      return {
        id: `cash-register_${item.id}`,
        originalId: item.id,
        type: "cash-register" as PendingInstallationType,
        contractId: item.contractId,
        contractNo: contract?.no,
        customerId: contract?.customerId,
        brand: item.brand,
        model: item.model,
        licanceId: item.licanceId,
        price: item.price,
        currency: item.currency,
        yearly: item.yearly,
        startDate: item.startDate,
        editDate: item.editDate
      };
    }
  );

  // SaaS'ı normalize et
  const saasItems: PendingInstallationItem[] = saasRes.data.map(
    (item: ContractSaas) => {
      const contract = contractMap.get(item.contractId);
      return {
        id: `saas_${item.id}`,
        originalId: item.id,
        type: "saas" as PendingInstallationType,
        contractId: item.contractId,
        contractNo: contract?.no,
        customerId: contract?.customerId,
        brand: item.brand,
        description: item.description,
        licanceId: item.licanceId,
        price: item.price,
        currency: item.currency,
        yearly: item.yearly,
        startDate: item.startDate,
        editDate: item.editDate
      };
    }
  );

  // Support'ları normalize et
  const supportItems: PendingInstallationItem[] = supportsRes.data.map(
    (item: ContractSupport) => {
      const contract = contractMap.get(item.contractId);
      return {
        id: `support_${item.id}`,
        originalId: item.id,
        type: "support" as PendingInstallationType,
        contractId: item.contractId,
        contractNo: contract?.no,
        customerId: contract?.customerId,
        brand: item.brand,
        licanceId: item.licanceId,
        price: item.price,
        currency: item.currency,
        yearly: item.yearly,
        startDate: item.startDate,
        editDate: item.editDate
      };
    }
  );

  // Tüm verileri birleştir
  const allItems = [...cashRegisterItems, ...saasItems, ...supportItems];

  return {
    data: allItems,
    total: allItems.length,
    counts: {
      cashRegister: cashRegistersRes.total,
      saas: saasRes.total,
      support: supportsRes.total
    }
  };
}
