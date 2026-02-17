import { useMemo } from "react";
import { Modal } from "../../../components/ui/Modal";
import { AlertTriangle, Merge, Split } from "lucide-react";
import type { EnrichedPaymentPlan } from "../types";

/** Cari bazinda gruplandırılmış plan bilgisi */
interface CustomerGroup {
  customerId: string;
  company: string;
  planCount: number;
  totalAmount: number;
}

interface MergeConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Secili planlar */
  selectedPlans: EnrichedPaymentPlan[];
  /** Birlestir secildiginde */
  onMerge: () => void;
  /** Ayri olustur secildiginde */
  onSeparate: () => void;
  /** Islem devam ediyor mu */
  isLoading?: boolean;
}

/**
 * Ayni cariye ait birden fazla plan secildiginde
 * kullaniciya birlestirme secenegi sunan dialog.
 */
export function MergeConfirmDialog({
  isOpen,
  onClose,
  selectedPlans,
  onMerge,
  onSeparate,
  isLoading = false,
}: MergeConfirmDialogProps) {
  // Planlari customerId bazinda grupla
  const customerGroups = useMemo<CustomerGroup[]>(() => {
    const groupMap = new Map<string, CustomerGroup>();

    for (const plan of selectedPlans) {
      const existing = groupMap.get(plan.customerId);
      if (existing) {
        existing.planCount += 1;
        existing.totalAmount += plan.total || 0;
      } else {
        groupMap.set(plan.customerId, {
          customerId: plan.customerId,
          company: plan.company || plan.brand || "Bilinmeyen",
          planCount: 1,
          totalAmount: plan.total || 0,
        });
      }
    }

    return Array.from(groupMap.values());
  }, [selectedPlans]);

  // Birden fazla plani olan cariler
  const multiPlanCustomers = useMemo(
    () => customerGroups.filter((g) => g.planCount > 1),
    [customerGroups]
  );

  // Para formati
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Toplam plan sayisi ve tutar
  const totalPlans = selectedPlans.length;
  const totalAmount = selectedPlans.reduce((sum, p) => sum + (p.total || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fatura Birleştirme" size="md">
      <div className="space-y-4">
        {/* Uyari mesaji */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30">
          <AlertTriangle className="w-5 h-5 text-[var(--color-warning)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--color-foreground)]">
            <p className="font-medium mb-1">
              {multiPlanCustomers.length} cari için birden fazla plan seçildi
            </p>
            <p className="text-[var(--color-muted-foreground)]">
              Aynı cariye ait planları tek faturada birleştirmek ister misiniz?
            </p>
          </div>
        </div>

        {/* Cari listesi */}
        <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)]">
            <span className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">
              Birleştirilecek Cariler
            </span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {multiPlanCustomers.map((group) => (
              <div
                key={group.customerId}
                className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)] last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-foreground)] truncate">
                    {group.company}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {group.planCount} plan
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-mono font-medium text-[var(--color-foreground)]">
                    {formatCurrency(group.totalAmount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ozet */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-surface-elevated)]">
          <span className="text-sm text-[var(--color-muted-foreground)]">
            Toplam: {totalPlans} plan
          </span>
          <span className="text-sm font-mono font-semibold text-[var(--color-foreground)]">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={onMerge}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Merge className="w-4 h-4" />
            {isLoading ? "İşleniyor..." : "Evet, Birleştir"}
          </button>
          <button
            onClick={onSeparate}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-surface-elevated)] rounded-lg hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
          >
            <Split className="w-4 h-4" />
            {isLoading ? "İşleniyor..." : "Hayır, Ayrı Oluştur"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
