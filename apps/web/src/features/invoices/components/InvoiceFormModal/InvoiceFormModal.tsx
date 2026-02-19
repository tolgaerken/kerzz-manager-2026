import { useState, useEffect, useMemo } from "react";
import { Save } from "lucide-react";
import { Grid, type GridColumnDef } from "@kerzz/grid";
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
  const [activeTab, setActiveTab] = useState<"general" | "rows">("general");

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
      setActiveTab("general");
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

  const invoiceRowsColumns = useMemo<GridColumnDef<Invoice["invoiceRows"][number]>[]>(
    () => [
      {
        id: "code",
        header: "Kod",
        accessorKey: "code",
        width: 140,
        sortable: true,
        resizable: true,
      },
      {
        id: "name",
        header: "Ad",
        accessorKey: "name",
        width: 260,
        sortable: true,
        resizable: true,
      },
      {
        id: "description",
        header: "Açıklama",
        accessorKey: "description",
        width: 260,
        sortable: true,
        resizable: true,
      },
      {
        id: "quantity",
        header: "Miktar",
        accessorKey: "quantity",
        width: 110,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "unitPrice",
        header: "Birim Fiyat",
        accessorKey: "unitPrice",
        width: 130,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "discount",
        header: "İskonto",
        accessorKey: "discount",
        width: 110,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "taxRate",
        header: "KDV Oranı",
        accessorKey: "taxRate",
        width: 120,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "taxTotal",
        header: "KDV Tutarı",
        accessorKey: "taxTotal",
        width: 130,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "total",
        header: "Toplam",
        accessorKey: "total",
        width: 130,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "grandTotal",
        header: "Genel Toplam",
        accessorKey: "grandTotal",
        width: 140,
        align: "right",
        sortable: true,
        resizable: true,
      },
      {
        id: "stoppageAmount",
        header: "Stopaj",
        accessorKey: "stoppageAmount",
        width: 120,
        align: "right",
        sortable: true,
        resizable: true,
      },
    ],
    []
  );

  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fatura Detayı" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="mb-4 inline-flex w-fit items-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "general"
                ? "bg-[var(--color-surface)] text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rows")}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "rows"
                ? "bg-[var(--color-surface)] text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            }`}
          >
            Satırlar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "general" && (
            <div className="space-y-4 sm:space-y-6">
              {/* Fatura Bilgileri - Salt okunur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-[var(--color-surface-elevated)] rounded-lg">
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Fatura No</label>
                  <p className="font-medium text-sm sm:text-base">{invoice.invoiceNumber || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Müşteri</label>
                  <p className="font-medium text-sm sm:text-base break-words">{invoice.name || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Fatura Tarihi</label>
                  <p className="font-medium text-sm sm:text-base">{formatDate(invoice.invoiceDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Son Ödeme Tarihi</label>
                  <p className="font-medium text-sm sm:text-base">{formatDate(invoice.dueDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Fatura Tipi</label>
                  <p className="font-medium text-sm sm:text-base">
                    {INVOICES_CONSTANTS.INVOICE_TYPES.find((t) => t.id === invoice.invoiceType)?.name || invoice.invoiceType}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Firma</label>
                  <p className="font-medium text-sm sm:text-base">{invoice.internalFirm || "-"}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">Toplam</label>
                  <p className="font-medium text-sm sm:text-base">{formatCurrency(invoice.total)}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-foreground-muted)]">KDV</label>
                  <p className="font-medium text-sm sm:text-base">{formatCurrency(invoice.taxTotal)}</p>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs text-[var(--color-foreground-muted)]">Genel Toplam</label>
                  <p className="text-lg sm:text-xl font-bold text-[var(--color-info)]">{formatCurrency(invoice.grandTotal)}</p>
                </div>
              </div>

              {/* Düzenlenebilir alanlar */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-medium text-sm sm:text-base text-[var(--color-foreground)]">Ödeme Bilgileri</h3>
                
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
                      className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
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
                    className="w-full px-3 py-2 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "rows" && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 text-sm text-[var(--color-muted-foreground)]">
                Toplam Satır: {invoice.invoiceRows?.length || 0}
              </div>
              <div className="h-[420px] rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                <Grid<Invoice["invoiceRows"][number]>
                  data={invoice.invoiceRows || []}
                  columns={invoiceRowsColumns}
                  height="100%"
                  locale="tr"
                  stateKey="invoice-rows-grid"
                  getRowId={(row) => row.id}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-[var(--color-border)] mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 sm:py-2 text-sm font-medium rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-md hover:opacity-90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
