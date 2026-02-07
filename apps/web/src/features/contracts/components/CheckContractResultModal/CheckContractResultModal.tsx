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
    <div className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-b-0">
      <span className="text-sm text-[var(--color-foreground-muted)]">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-[var(--color-foreground-muted)]">
          {formatCurrency(before)}
        </span>
        <ArrowRight className="h-3 w-3 text-[var(--color-foreground-muted)]" />
        <span className="text-sm font-mono font-semibold text-[var(--color-foreground)]">
          {formatCurrency(after)}
        </span>
        {!isZero && (
          <span className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded ${
            isPositive
              ? "bg-red-500/10 text-red-600"
              : "bg-green-500/10 text-green-600"
          }`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{formatCurrency(diff)}
          </span>
        )}
        {isZero && (
          <span className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-500">
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
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-[var(--color-foreground)]">
              {contract.brand || contract.company} - Plan hesaplandi
            </p>
            <p className="text-sm text-[var(--color-foreground-muted)]">
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
          <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-elevated)] text-left">
                  <th className="px-4 py-2.5 font-medium text-[var(--color-foreground-muted)]">Aciklama</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-foreground-muted)] text-right">Miktar</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-foreground-muted)] text-right">Birim Fiyat</th>
                  <th className="px-4 py-2.5 font-medium text-[var(--color-foreground-muted)] text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {invoiceSummary.rows.map((row) => (
                  <tr key={row.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2.5 text-[var(--color-foreground)]">{row.description}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--color-foreground)] font-mono">{row.qty}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--color-foreground)] font-mono">{formatCurrency(row.unitPrice)}</td>
                    <td className="px-4 py-2.5 text-right text-[var(--color-foreground)] font-semibold font-mono">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-[var(--color-foreground)]">
                    Genel Toplam
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[var(--color-foreground)] font-mono text-base">
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
          <div className="rounded-lg border border-[var(--color-border)] overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className="bg-[var(--color-surface-elevated)] text-left">
                  <th className="px-4 py-2 font-medium text-[var(--color-foreground-muted)]">Tarih</th>
                  <th className="px-4 py-2 font-medium text-[var(--color-foreground-muted)] text-right">Tutar</th>
                  <th className="px-4 py-2 font-medium text-[var(--color-foreground-muted)] text-center">Fatura</th>
                  <th className="px-4 py-2 font-medium text-[var(--color-foreground-muted)] text-center">Odeme</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-t border-[var(--color-border)]">
                    <td className="px-4 py-2 text-[var(--color-foreground)]">
                      {new Date(plan.payDate).toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--color-foreground)] font-mono">
                      {formatCurrency(plan.total)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {plan.invoiceNo ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          {plan.invoiceNo}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">
                          Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        plan.paid
                          ? "bg-green-500/10 text-green-600"
                          : "bg-amber-500/10 text-amber-600"
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
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
}
