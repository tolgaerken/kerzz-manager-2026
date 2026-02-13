import { useMemo, useState, useCallback } from "react";
import { MessageSquare, Receipt } from "lucide-react";
import { Grid } from "@kerzz/grid";
import type { ToolbarButtonConfig } from "@kerzz/grid";
import { useContractCashRegisters } from "../../features/contracts/hooks/useContractDetail";
import { useActiveEftPosModels } from "../../features/contracts/hooks/useEftPosModels";
import { useLicenses } from "../../features/licenses/hooks/useLicenses";
import { useContracts } from "../../features/contracts/hooks/useContracts";
import { useCustomers } from "../../features/customers/hooks/useCustomers";
import type { ContractCashRegister } from "../../features/contracts/types";
import { contractCashRegistersColumns } from "../../features/contracts/components/ContractDetailModal/columnDefs";
import { useLogPanelStore } from "../../features/manager-log";
import {
  AccountTransactionsModal,
  useAccountTransactionsStore,
} from "../../features/account-transactions";

export function AllRecordsCashRegistersGrid() {
  const { data, isLoading } = useContractCashRegisters(undefined, true);
  const { data: licensesData } = useLicenses({ limit: 10000, sortField: "licenseId", sortOrder: "asc", fields: ["id", "brandName", "SearchItem"] });
  const { data: eftPosModelsData } = useActiveEftPosModels();
  
  // Tüm sözleşmeleri çek (contractId -> customerId + internalFirm mapping için)
  const { data: contractsData } = useContracts({ limit: 10000 });
  
  // Tüm müşterileri çek (customerId -> erpId mapping için)
  const { data: customersData } = useCustomers({ limit: 10000 });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<ContractCashRegister | null>(null);

  // Log panel store
  const { openEntityPanel } = useLogPanelStore();

  // Account transactions store
  const { openModal: openAccountTransactionsModal } = useAccountTransactionsStore();

  const licenses = useMemo(() => {
    return licensesData?.data
      ?.filter((lic) => lic.id != null)
      .map((lic) => ({
        _id: lic._id,
        id: lic.id,
        brandName: lic.brandName,
        SearchItem: lic.SearchItem || lic.brandName,
      })) || [];
  }, [licensesData]);

  const eftPosModels = useMemo(() => {
    return (
      eftPosModelsData?.data?.map((model) => ({
        id: model.id,
        name: model.name,
      })) || []
    );
  }, [eftPosModelsData]);

  const gridContext = useMemo(
    () => ({ licenses, eftPosModels }),
    [licenses, eftPosModels]
  );

  const cashRegisters = data?.data || [];

  /** contractId -> Contract mapping (customerId ve internalFirm bilgisi için) */
  const contractMap = useMemo(() => {
    const map = new Map<string, { customerId: string; internalFirm: string; company: string }>();
    const contracts = contractsData?.data || [];
    for (const contract of contracts) {
      map.set(contract.id, {
        customerId: contract.customerId,
        internalFirm: contract.internalFirm,
        company: contract.company,
      });
    }
    return map;
  }, [contractsData]);

  /** customerId -> Customer mapping (erpId bilgisi için) */
  const customerMap = useMemo(() => {
    const map = new Map<string, { erpId?: string; name?: string; companyName?: string }>();
    const customers = customersData?.data || [];
    for (const customer of customers) {
      map.set(customer._id, {
        erpId: customer.erpId,
        name: customer.name,
        companyName: customer.companyName,
      });
    }
    return map;
  }, [customersData]);

  // Selection değişikliği
  const handleSelectionChange = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
      // Son seçilen item'ı selectedItem olarak ayarla
      if (ids.length > 0 && cashRegisters.length > 0) {
        const lastSelectedId = ids[ids.length - 1];
        const item = cashRegisters.find((p) => (p.id || p._id) === lastSelectedId);
        if (item) {
          setSelectedItem(item);
        }
      } else if (ids.length === 0) {
        setSelectedItem(null);
      }
    },
    [cashRegisters]
  );

  // Log panelini aç (toolbar butonu)
  const handleOpenLogs = useCallback(() => {
    if (!selectedItem) return;
    const contract = contractMap.get(selectedItem.contractId);
    if (!contract) return;
    openEntityPanel({
      customerId: contract.customerId,
      activeTab: "contract",
      title: `Sözleşme: ${contract.company || selectedItem.contractId}`,
    });
  }, [selectedItem, contractMap, openEntityPanel]);

  // Cari hareketleri modalını aç (toolbar butonu)
  const handleOpenAccountTransactions = useCallback(() => {
    if (!selectedItem) return;
    const contract = contractMap.get(selectedItem.contractId);
    if (!contract) return;
    const customer = customerMap.get(contract.customerId);
    if (!customer?.erpId) return;
    openAccountTransactionsModal(customer.erpId, contract.internalFirm);
  }, [selectedItem, contractMap, customerMap, openAccountTransactionsModal]);

  // Seçili kaydın contract mapping'i var mı?
  const hasContractMapping = useMemo(() => {
    if (!selectedItem) return false;
    return contractMap.has(selectedItem.contractId);
  }, [selectedItem, contractMap]);

  // Seçili kaydın erpId'si var mı? (cari hareket için gerekli)
  const hasErpId = useMemo(() => {
    if (!selectedItem) return false;
    const contract = contractMap.get(selectedItem.contractId);
    if (!contract) return false;
    const customer = customerMap.get(contract.customerId);
    return !!customer?.erpId;
  }, [selectedItem, contractMap, customerMap]);

  // Toolbar custom butonları
  const toolbarCustomButtons = useMemo<ToolbarButtonConfig[]>(() => {
    const buttons: ToolbarButtonConfig[] = [];

    // Loglar
    buttons.push({
      id: "open-logs",
      label: "Log",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      onClick: handleOpenLogs,
      disabled: !selectedItem || selectedIds.length > 1 || !hasContractMapping,
      variant: "default",
      title: "Seçili sözleşmenin loglarını görüntüle",
    });

    // Cari Hareketleri
    buttons.push({
      id: "account-transactions",
      label: "Cari Hareket",
      icon: <Receipt className="w-3.5 h-3.5" />,
      onClick: handleOpenAccountTransactions,
      disabled: !selectedItem || selectedIds.length > 1 || !hasErpId,
      variant: "primary",
      title: "Seçili sözleşmenin cari hareketlerini görüntüle",
    });

    return buttons;
  }, [selectedIds.length, selectedItem, handleOpenLogs, handleOpenAccountTransactions, hasContractMapping, hasErpId]);

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 min-h-0">
        <Grid<ContractCashRegister>
          data={cashRegisters}
          columns={contractCashRegistersColumns}
          loading={isLoading}
          getRowId={(row) => row.id || row._id}
          context={gridContext}
          height="100%"
          locale="tr"
          selectionMode="multiple"
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          toolbar={{
            exportFileName: "kontor_yuklemeleri",
            customButtons: toolbarCustomButtons,
          }}
        />
      </div>

      {/* Account Transactions Modal */}
      <AccountTransactionsModal />
    </div>
  );
}
