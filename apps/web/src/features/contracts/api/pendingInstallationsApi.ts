import {
  fetchContractCashRegisters,
  fetchContractSaas,
  fetchContractSupports,
  fetchInvoicedSourceItemIds
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
 * Faturası kesilmiş olanları hariç tutar
 */
export async function fetchPendingInstallations(): Promise<PendingInstallationsResponse> {
  // Paralel olarak tüm verileri çek
  // activated: false → kurulum bekleyen
  const [cashRegistersRes, saasRes, supportsRes, contractsRes, invoicedRes] = await Promise.all([
    fetchContractCashRegisters({ activated: false }),
    fetchContractSaas({ activated: false }),
    fetchContractSupports({ activated: false }),
    fetchContracts({ flow: "all", limit: 99999 }),
    fetchInvoicedSourceItemIds()
  ]);

  // Faturası kesilmiş sourceItemId'leri set olarak tut (hızlı lookup için)
  const invoicedSourceItemIds = new Set(invoicedRes.data);

  // Contract map oluştur (hızlı erişim için)
  // Alt öğelerdeki contractId, contracts koleksiyonundaki id alanına karşılık gelir
  const contractMap = new Map<string, Contract>();
  contractsRes.data.forEach((contract) => {
    contractMap.set(contract.id, contract);
  });

  // Cash registers'ı normalize et ve fatura kesilmiş olanları filtrele
  const cashRegisterItems: PendingInstallationItem[] = cashRegistersRes.data
    .filter((item: ContractCashRegister) => !invoicedSourceItemIds.has(item.id))
    .map((item: ContractCashRegister) => {
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
    });

  // SaaS'ı normalize et ve fatura kesilmiş olanları filtrele
  const saasItems: PendingInstallationItem[] = saasRes.data
    .filter((item: ContractSaas) => !invoicedSourceItemIds.has(item.id))
    .map((item: ContractSaas) => {
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
    });

  // Support'ları normalize et ve fatura kesilmiş olanları filtrele
  const supportItems: PendingInstallationItem[] = supportsRes.data
    .filter((item: ContractSupport) => !invoicedSourceItemIds.has(item.id))
    .map((item: ContractSupport) => {
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
    });

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
