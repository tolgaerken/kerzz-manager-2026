/**
 * Bildirim template verilerini hazirlamak icin yardimci fonksiyonlar.
 * Cron job'lar ve notification-queue servisi tarafindan ortak kullanilir.
 */

/**
 * Türk telefon numaralarını standart formata normalize eder: 05XXXXXXXXX
 * Örnekler:
 *   +905551234567  → 05551234567
 *   905551234567   → 05551234567
 *   5551234567     → 05551234567
 *   0555 123 45 67 → 05551234567
 */
export function normalizePhone(phone: string | undefined | null): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("90")) {
    digits = "0" + digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith("5")) {
    digits = "0" + digits;
  }
  return digits;
}

export function normalizeEmail(email: string | undefined | null): string {
  return (email ?? "").trim().toLowerCase();
}

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
  invoiceUUID?: string;
}

export interface CustomerLike {
  name?: string;
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

export interface ContractRenewalData {
  paymentLink: string;
  renewalAmount: number;
  oldAmount: number;
  increaseRateInfo: string;
  daysFromExpiry: number;
  terminationDate: string;
  milestone: "pre-expiry" | "post-1" | "post-3" | "post-5" | "termination";
}

/**
 * Bildirim kaynağını belirten tip.
 * cron: Otomatik cron job tarafından tetiklendi
 * manual: Kullanıcı tarafından manuel gönderildi
 */
export type NotificationSource = "cron" | "manual";

/**
 * Bildirim bağlam tipi.
 */
export type NotificationContextType = "invoice" | "contract";

/**
 * Fatura goruntuleme linki olusturur.
 * invoiceUUID varsa captcha korumalı görüntüleme sayfasına yönlendirir.
 */
export function buildInvoiceViewLink(
  invoiceUUID: string | undefined,
  webBaseUrl: string
): string {
  if (!invoiceUUID) {
    return "";
  }
  return `${webBaseUrl}/fatura-goruntule/${invoiceUUID}`;
}

/**
 * Fatura icin template data olusturur.
 * paymentLink: olusturulmus odeme linki URL'si (PaymentsService araciligiyla uretilmeli)
 * source: bildirim kaynağı (cron veya manual)
 * contactName: mesajin gonderildigi kisinin adi (opsiyonel, yoksa firma adi kullanilir)
 * webBaseUrl: fatura goruntuleme linki icin web uygulaması base URL'i
 */
export function buildInvoiceTemplateData(
  invoice: InvoiceLike,
  customer: CustomerLike,
  paymentLink: string,
  overdueDays?: number,
  source: NotificationSource = "cron",
  contactName?: string,
  webBaseUrl?: string
): Record<string, string> {
  const confirmLink = webBaseUrl && invoice.invoiceUUID
    ? buildInvoiceViewLink(invoice.invoiceUUID, webBaseUrl)
    : paymentLink;

  return {
    company: customer.name || "",
    customerName: contactName || "Yetkili",
    invoiceNumber: invoice.invoiceNumber || "",
    amount: formatCurrency(invoice.grandTotal || 0),
    dueDate: formatDate(invoice.dueDate),
    overdueDays: overdueDays?.toString() ?? "0",
    paymentLink,
    confirmLink,
    notificationSource: source,
    recordType: "invoice",
    recordId: invoice.id,
    invoiceNo: invoice.invoiceNumber || "",
  };
}

/**
 * Kontrat icin template data olusturur (eski format - geriye uyumluluk)
 * source: bildirim kaynağı (cron veya manual)
 * contactName: mesajin gonderildigi kisinin adi (opsiyonel, yoksa firma adi kullanilir)
 */
export function buildContractTemplateData(
  contract: ContractLike,
  customer: CustomerLike,
  remainingDays: number,
  source: NotificationSource = "cron",
  contactName?: string
): Record<string, string> {
  return {
    company: contract.company || customer.name || "",
    customerName: contactName || "Yetkili",
    contractEndDate: formatDate(contract.endDate),
    remainingDays: remainingDays.toString(),
    notificationSource: source,
    recordType: "contract",
    recordId: contract.id,
    contractNo: contract.contractId || "",
  };
}

/**
 * Yıllık kontrat yenileme bildirimi için genişletilmiş template data oluşturur.
 * Ödeme linki, artış bilgileri ve sonlandırma tarihi içerir.
 * source: bildirim kaynağı (cron veya manual)
 * contactName: mesajin gonderildigi kisinin adi (opsiyonel, yoksa firma adi kullanilir)
 */
export function buildContractRenewalTemplateData(
  contract: ContractLike,
  customer: CustomerLike,
  renewalData: ContractRenewalData,
  source: NotificationSource = "cron",
  contactName?: string
): Record<string, string> {
  const endDate = contract.endDate ? new Date(contract.endDate) : new Date();
  const terminationDate = new Date(endDate);
  terminationDate.setDate(terminationDate.getDate() + 6);

  return {
    company: contract.company || customer.name || "",
    customerName: contactName || "Yetkili",
    contractEndDate: formatDate(contract.endDate),
    daysFromExpiry: renewalData.daysFromExpiry.toString(),
    paymentLink: renewalData.paymentLink,
    renewalAmount: formatCurrency(renewalData.renewalAmount),
    oldAmount: formatCurrency(renewalData.oldAmount),
    increaseRateInfo: renewalData.increaseRateInfo,
    terminationDate: formatDate(terminationDate),
    milestone: renewalData.milestone,
    isPreExpiry: renewalData.daysFromExpiry > 0 ? "true" : "false",
    isPostExpiry: renewalData.daysFromExpiry <= 0 ? "true" : "false",
    isLastWarning: renewalData.milestone === "post-5" ? "true" : "false",
    notificationSource: source,
    recordType: "contract",
    recordId: contract.id,
    contractNo: contract.contractId || "",
    renewalAmountRaw: renewalData.renewalAmount.toString(),
    oldAmountRaw: renewalData.oldAmount.toString(),
  };
}
