import { Modal } from "../../../../components/ui/Modal";
import { CheckCircle, FileText, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { Contract, CheckContractResult } from "../../types";

interface CheckContractResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract;
  beforeContract: Contract;
  result: CheckContractResult;
}

interface DiffItemProps {
  label: string;
  before: number;
  after: number;
}

function DiffItem({ label, before, after }: DiffItemProps) {
  const diff = after - before;
  const isPositive = diff > 0;
  const isZero = diff === 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-[var(--color-border)] last:border-b-0 gap-1 sm:gap-3">
      <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="text-xs sm:text-sm font-mono text-[var(--color-muted-foreground)]">
          {formatCurrency(before)}
        </span>
        <ArrowRight className="h-3 w-3 text-[var(--color-muted-foreground)]" />
        <span className="text-xs sm:text-sm font-mono font-semibold text-[var(--color-foreground)]">
          {formatCurrency(after)}
        </span>
        {!isZero && (
          <span className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive
              ? "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{formatCurrency(diff)}
          </span>
        )}
        {isZero && (
          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
            <Minus className="h-3 w-3" />
            Degisim yok
          </span>
        )}
      </div>
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

export function CheckContractResultModal({
  isOpen,
  onClose,
  contract,
  beforeContract,
  result,
}: CheckContractResultModalProps) {
  const { invoiceSummary, plans } = result;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Odeme Plani Hesaplama Sonucu" size="xl">
      <div className="space-y-6">
        {/* Basarili Bildirimi */}
        <div className="flex items-start sm:items-center gap-3 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-3 sm:p-4">
          <CheckCircle className="h-5 w-5 text-[var(--color-success)] flex-shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0">
            <p className="font-medium text-[var(--color-foreground)] text-sm sm:text-base truncate">
              {contract.brand || contract.company} - Plan hesaplandi
            </p>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              {plans.length} aylik plan olusturuldu, toplam: {formatCurrency(invoiceSummary.total)}
            </p>
          </div>
        </div>

        {/* Oncesi / Sonrasi Karsilastirmasi */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Oncesi / Sonrasi Karsilastirmasi
          </h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4">
            <DiffItem
              label="Aylik Toplam"
              before={beforeContract.total}
              after={contract.total}
            />
            <DiffItem
              label="Yillik Toplam"
              before={beforeContract.yearlyTotal}
              after={contract.yearlyTotal}
            />
            <DiffItem
              label="SaaS Toplam"
              before={beforeContract.saasTotal}
              after={contract.saasTotal}
            />
          </div>
        </div>

        {/* Fatura Ozeti */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Fatura Ozeti ({invoiceSummary.rows.length} kalem)
          </h3>
          <div className="rounded-lg border border-[var(--color-border)] overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[400px]">
              <thead>
                <tr className="bg-[var(--color-surface-elevated)] text-left">
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-[var(--color-muted-foreground)]">Aciklama</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-[var(--color-muted-foreground)] text-right">Miktar</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-[var(--color-muted-foreground)] text-right">Birim Fiyat</th>
                  <th className="px-3 sm:px-4 py-2 sm:py-2.5 font-medium text-[var(--color-muted-foreground)] text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {invoiceSummary.rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-[var(--color-foreground)]">{row.description}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[var(--color-foreground)] font-mono">{row.qty}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[var(--color-foreground)] font-mono">{formatCurrency(row.unitPrice)}</td>
                    <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[var(--color-foreground)] font-semibold font-mono">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                  <td colSpan={3} className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-semibold text-[var(--color-foreground)]">
                    Genel Toplam
                  </td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right font-bold text-[var(--color-foreground)] font-mono text-sm sm:text-base">
                    {formatCurrency(invoiceSummary.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Odeme Plani Ozeti */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
            Odeme Plani ({plans.length} ay)
          </h3>
          <div className="rounded-lg border border-[var(--color-border)] overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs sm:text-sm min-w-[360px]">
              <thead className="sticky top-0">
                <tr className="bg-[var(--color-surface-elevated)] text-left">
                  <th className="px-3 sm:px-4 py-2 font-medium text-[var(--color-muted-foreground)]">Tarih</th>
                  <th className="px-3 sm:px-4 py-2 font-medium text-[var(--color-muted-foreground)] text-right">Tutar</th>
                  <th className="px-3 sm:px-4 py-2 font-medium text-[var(--color-muted-foreground)] text-center">Fatura</th>
                  <th className="px-3 sm:px-4 py-2 font-medium text-[var(--color-muted-foreground)] text-center">Odeme</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-t border-[var(--color-border)]">
                    <td className="px-3 sm:px-4 py-2 text-[var(--color-foreground)] whitespace-nowrap">
                      {new Date(plan.payDate).toLocaleDateString("tr-TR", { month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-right text-[var(--color-foreground)] font-mono">
                      {formatCurrency(plan.total)}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-center">
                      {plan.invoiceNo ? (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[var(--color-success)]/10 text-[var(--color-success)]">
                          {plan.invoiceNo}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-[var(--color-muted-foreground)]/10 text-[var(--color-muted-foreground)]">
                          Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-center">
                      <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
                        plan.paid
                          ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                          : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                      }`}>
                        {plan.paid ? "Odendi" : "Odenmedi"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kapat Butonu */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
}
