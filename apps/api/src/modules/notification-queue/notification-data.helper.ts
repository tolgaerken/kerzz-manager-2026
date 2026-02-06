/**
 * Bildirim template verilerini hazirlamak icin yardimci fonksiyonlar.
 * Cron job'lar ve notification-queue servisi tarafindan ortak kullanilir.
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function formatDate(date: Date | undefined): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export interface InvoiceLike {
  id: string;
  invoiceNumber?: string;
  grandTotal?: number;
  dueDate?: Date;
  customerId?: string;
}

export interface CustomerLike {
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
}

export interface ContractLike {
  id: string;
  contractId?: string;
  company?: string;
  endDate?: Date;
  customerId?: string;
}

/**
 * Fatura icin template data olusturur
 */
export function buildInvoiceTemplateData(
  invoice: InvoiceLike,
  customer: CustomerLike,
  overdueDays?: number
): Record<string, string> {
  return {
    company: customer.companyName || customer.name || "",
    customerName: customer.name || "",
    invoiceNumber: invoice.invoiceNumber || "",
    amount: formatCurrency(invoice.grandTotal || 0),
    dueDate: formatDate(invoice.dueDate),
    overdueDays: overdueDays?.toString() ?? "0",
    paymentLink: `https://pay.kerzz.com/${invoice.id}`,
    confirmLink: `https://manager.kerzz.com/confirm/${invoice.id}`,
  };
}

/**
 * Kontrat icin template data olusturur
 */
export function buildContractTemplateData(
  contract: ContractLike,
  customer: CustomerLike,
  remainingDays: number
): Record<string, string> {
  return {
    company:
      contract.company || customer.companyName || customer.name || "",
    customerName: customer.name || "",
    contractEndDate: formatDate(contract.endDate),
    remainingDays: remainingDays.toString(),
  };
}
