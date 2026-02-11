import { useState, useCallback } from "react";
import { Building2, Calendar, CreditCard, TrendingUp, Pencil } from "lucide-react";
import type { Contract, UpdateContractInput } from "../../../types";
import { ContractEditFormModal } from "../../ContractEditFormModal";
import { useUpdateContract } from "../../../hooks/useUpdateContract";

interface ContractSummaryTabProps {
  contract: Contract;
  onContractUpdated?: (contract: Contract) => void;
}

export function ContractSummaryTab({ contract, onContractUpdated }: ContractSummaryTabProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const updateMutation = useUpdateContract();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY"
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR");
  };

  const handleEditOpen = useCallback(() => {
    setIsEditOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditOpen(false);
  }, []);

  const handleEditSubmit = useCallback(
    (data: UpdateContractInput) => {
      updateMutation.mutate(data, {
        onSuccess: (updatedContract) => {
          onContractUpdated?.(updatedContract);
          setIsEditOpen(false);
        }
      });
    },
    [updateMutation, onContractUpdated]
  );

  return (
    <div className="space-y-6 h-full overflow-auto">
      {updateMutation.isError && (
        <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
          {updateMutation.error instanceof Error
            ? updateMutation.error.message
            : "Kontrat güncellenirken bir hata oluştu"}
        </div>
      )}
      {/* Genel Bilgiler */}
      <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Genel Bilgiler
          </h3>
          <button
            type="button"
            onClick={handleEditOpen}
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-md border border-border-subtle bg-surface px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-foreground transition-colors hover:border-border hover:bg-surface-elevated"
          >
            <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">Düzenle</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Kontrat No</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{contract.no}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Firma</p>
            <p className="text-sm sm:text-base font-medium text-foreground truncate">{contract.company || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Marka</p>
            <p className="text-sm sm:text-base font-medium text-foreground truncate">{contract.brand}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Müşteri ID</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{contract.customerId || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Dahili Firma</p>
            <p className="text-sm sm:text-base font-medium text-foreground truncate">{contract.internalFirm || "-"}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Ödeme Tipi</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{contract.yearly ? "Yıllık" : "Aylık"}</p>
          </div>
        </div>
      </div>

      {/* Tarih Bilgileri */}
      <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Tarih Bilgileri
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Başlangıç</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{formatDate(contract.startDate)}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Bitiş</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{formatDate(contract.endDate)}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Oluşturulma</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{formatDate(contract.createdAt)}</p>
          </div>
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Güncelleme</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{formatDate(contract.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Finansal Özet */}
      <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Finansal Özet
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-lg bg-surface">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Toplam</p>
            <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(contract.total)}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-surface">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Yıllık Toplam</p>
            <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(contract.yearlyTotal)}</p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-surface">
            <p className="text-[10px] sm:text-xs text-muted-foreground">SaaS Toplam</p>
            <p className="text-base sm:text-lg font-bold text-foreground">{formatCurrency(contract.saasTotal)}</p>
          </div>
        </div>
      </div>

      {/* Durum */}
      <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
        <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Durum
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <span
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
              contract.enabled
                ? "bg-success/10 text-success"
                : "bg-muted/20 text-muted-foreground"
            }`}
          >
            {contract.enabled ? "Aktif" : "Pasif"}
          </span>
          {contract.blockedLicance && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-error/10 text-error">
              Lisans Blokeli
            </span>
          )}
          <span
            className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
              contract.yearly
                ? "bg-primary/10 text-primary"
                : "bg-warning/10 text-warning"
            }`}
          >
            {contract.yearly ? "Yıllık Ödeme" : "Aylık Ödeme"}
          </span>
        </div>
      </div>

      {/* Açıklama */}
      {contract.description && (
        <div className="rounded-lg border border-border bg-surface-elevated p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-2">Açıklama</h3>
          <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">
            {contract.description}
          </p>
        </div>
      )}

      <ContractEditFormModal
        isOpen={isEditOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        contract={contract}
      />
    </div>
  );
}
