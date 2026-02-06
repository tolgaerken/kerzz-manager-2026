import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Modal } from "../../../../components/ui";
import { INVOICES_CONSTANTS } from "../../constants/invoices.constants";
import type { Invoice, UpdateInvoiceInput } from "../../types";

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onSave: (id: string, data: UpdateInvoiceInput) => void;
  isLoading?: boolean;
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  invoice,
  onSave,
  isLoading = false
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState<UpdateInvoiceInput>({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        isPaid: invoice.isPaid,
        paymentSuccessDate: invoice.paymentSuccessDate 
          ? new Date(invoice.paymentSuccessDate).toISOString().split("T")[0] 
          : undefined,
        description: invoice.description,
        reference: invoice.reference
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (invoice) {
      onSave(invoice._id, formData);
    }
  };

  const handleChange = (field: keyof UpdateInvoiceInput, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Para formatı
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2
    }).format(value);
  };

  // Tarih formatı
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fatura Detayı" size="lg">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Fatura Detayı
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Fatura Bilgileri - Salt okunur */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-[var(--color-surface-elevated)] rounded-lg">
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Fatura No</label>
                <p className="font-medium">{invoice.invoiceNumber || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Müşteri</label>
                <p className="font-medium">{invoice.name || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Fatura Tarihi</label>
                <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Son Ödeme Tarihi</label>
                <p className="font-medium">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Fatura Tipi</label>
                <p className="font-medium">
                  {INVOICES_CONSTANTS.INVOICE_TYPES.find((t) => t.id === invoice.invoiceType)?.name || invoice.invoiceType}
                </p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Firma</label>
                <p className="font-medium">{invoice.internalFirm || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">Toplam</label>
                <p className="font-medium">{formatCurrency(invoice.total)}</p>
              </div>
              <div>
                <label className="text-xs text-[var(--color-foreground-muted)]">KDV</label>
                <p className="font-medium">{formatCurrency(invoice.taxTotal)}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-[var(--color-foreground-muted)]">Genel Toplam</label>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(invoice.grandTotal)}</p>
              </div>
            </div>

            {/* Düzenlenebilir alanlar */}
            <div className="space-y-4">
              <h3 className="font-medium text-[var(--color-foreground)]">Ödeme Bilgileri</h3>
              
              {/* Ödeme durumu */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={formData.isPaid || false}
                  onChange={(e) => {
                    handleChange("isPaid", e.target.checked);
                    if (e.target.checked && !formData.paymentSuccessDate) {
                      handleChange("paymentSuccessDate", new Date().toISOString().split("T")[0]);
                    }
                  }}
                  className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="isPaid" className="text-sm font-medium">
                  Fatura Ödendi
                </label>
              </div>

              {/* Ödeme tarihi */}
              {formData.isPaid && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ödeme Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.paymentSuccessDate || ""}
                    onChange={(e) => handleChange("paymentSuccessDate", e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              )}

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
              </div>

              {/* Referans */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Referans
                </label>
                <input
                  type="text"
                  value={formData.reference || ""}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
