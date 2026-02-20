import { useRef, useState, useMemo } from "react";
import { useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronDown, ChevronUp, TrendingUp, Calendar, Building2, CreditCard } from "lucide-react";
import { usePaymentInfo } from "../features/payments";
import {
  useContractPaymentDetail,
  CATEGORY_LABELS,
  type ContractPaymentItemDto,
  type ContractItemCategory,
} from "../features/contract-payment-detail";

const PAYTR_POST_URL = "https://www.paytr.com/odeme";
const PAYMENT_BASE_URL =
  import.meta.env.VITE_PAYMENT_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "dd MMMM yyyy", { locale: tr });
  } catch {
    return dateStr;
  }
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    tl: "₺",
    usd: "$",
    eur: "€",
  };
  return symbols[currency.toLowerCase()] || currency.toUpperCase();
}

interface CategoryGroupProps {
  category: ContractItemCategory;
  items: ContractPaymentItemDto[];
  defaultExpanded?: boolean;
}

function CategoryGroup({ category, items, defaultExpanded = false }: CategoryGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const categoryTotal = items.reduce((sum, item) => sum + item.newTotal, 0);
  const categoryOldTotal = items.reduce((sum, item) => sum + item.oldTotal, 0);

  return (
    <div className="border border-[var(--color-border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-[var(--color-foreground)]">
            {CATEGORY_LABELS[category]}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            ({items.length} kalem)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {formatCurrency(categoryTotal)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--color-muted-foreground)]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-[var(--color-border)]">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[var(--color-surface)] text-xs font-medium text-[var(--color-muted-foreground)]">
            <div className="col-span-5">Açıklama</div>
            <div className="col-span-2 text-right">Eski Fiyat</div>
            <div className="col-span-2 text-right">Yeni Fiyat</div>
            <div className="col-span-2 text-right">Toplam</div>
            <div className="col-span-1 text-right">Değ.</div>
          </div>
          {items.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 px-4 py-2 text-sm hover:bg-[var(--color-surface-hover)]"
            >
              <div className="col-span-5 text-[var(--color-foreground)] truncate" title={item.description}>
                {item.description || "-"}
                {item.qty > 1 && (
                  <span className="ml-1 text-xs text-[var(--color-muted-foreground)]">
                    x{item.qty}
                  </span>
                )}
              </div>
              <div className="col-span-2 text-right text-[var(--color-muted-foreground)]">
                {getCurrencySymbol(item.currency)}{item.oldPrice.toFixed(2)}
              </div>
              <div className="col-span-2 text-right text-[var(--color-foreground)]">
                {getCurrencySymbol(item.currency)}{item.newPrice.toFixed(2)}
              </div>
              <div className="col-span-2 text-right font-medium text-[var(--color-foreground)]">
                {getCurrencySymbol(item.currency)}{item.newTotal.toFixed(2)}
              </div>
              <div className={`col-span-1 text-right text-xs ${
                item.changePercent > 0
                  ? "text-[var(--color-error)]"
                  : item.changePercent < 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-muted-foreground)]"
              }`}>
                {item.changePercent > 0 ? "+" : ""}{item.changePercent.toFixed(0)}%
              </div>
            </div>
          ))}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[var(--color-surface)] text-sm font-medium">
            <div className="col-span-5 text-[var(--color-muted-foreground)]">Alt Toplam</div>
            <div className="col-span-2 text-right text-[var(--color-muted-foreground)]">
              {formatCurrency(categoryOldTotal)}
            </div>
            <div className="col-span-4 text-right text-[var(--color-foreground)]">
              {formatCurrency(categoryTotal)}
            </div>
            <div className="col-span-1" />
          </div>
        </div>
      )}
    </div>
  );
}

export function PublicContractPaymentPage() {
  const params = useParams({ strict: false });
  const linkId = params?.linkId ?? null;

  const { data: paymentInfo, isLoading: paymentLoading, error: paymentError } = usePaymentInfo(linkId);
  const { data: contractDetail, isLoading: detailLoading, error: detailError } = useContractPaymentDetail(linkId);

  const [cardDisplay, setCardDisplay] = useState("");
  const [storeCard, setStoreCard] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const groupedItems = useMemo(() => {
    if (!contractDetail?.items) return new Map<ContractItemCategory, ContractPaymentItemDto[]>();
    const groups = new Map<ContractItemCategory, ContractPaymentItemDto[]>();
    for (const item of contractDetail.items) {
      const existing = groups.get(item.category) || [];
      existing.push(item);
      groups.set(item.category, existing);
    }
    return groups;
  }, [contractDetail?.items]);

  const handleCardDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = v.replace(/(\d{4})(?=\d)/g, "$1-").replace(/-$/, "");
    setCardDisplay(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInfo || !formRef.current || isSubmitting) return;
    const cardInput = formRef.current.querySelector('input[name="card_number"]') as HTMLInputElement;
    const rawCard = cardDisplay.replace(/-/g, "");
    if (rawCard.length < 16) {
      return;
    }
    if (cardInput) cardInput.value = rawCard;
    setIsSubmitting(true);
    formRef.current.submit();
  };

  const isLoading = paymentLoading || detailLoading;
  const error = paymentError || detailError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <div className="text-[var(--color-muted-foreground)]">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            Ödeme bilgisi alınamadı
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {error?.message ?? "Link geçersiz veya süresi dolmuş olabilir."}
          </p>
        </div>
      </div>
    );
  }

  const merchantOkUrl = `${PAYMENT_BASE_URL}/payment_ok/${paymentInfo.id}`;
  const merchantFailUrl = `${PAYMENT_BASE_URL}/payment_error/${paymentInfo.id}`;
  const userBasket = btoa(
    unescape(encodeURIComponent(JSON.stringify([["Kontrat Odeme", paymentInfo.paymentAmount, 1]])))
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-6 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
            Kontrat Ödeme Detayı
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
            PayTR ile 256-bit SSL koruması
          </p>
        </div>

        {/* Contract Info Card */}
        {contractDetail && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
                <h2 className="font-semibold text-[var(--color-foreground)]">
                  Kontrat Bilgileri
                </h2>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)] mb-1">Firma</div>
                  <div className="font-medium text-[var(--color-foreground)]">
                    {contractDetail.contract.company || contractDetail.contract.brand}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)] mb-1">Marka</div>
                  <div className="font-medium text-[var(--color-foreground)]">
                    {contractDetail.contract.brand}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)] mb-1">Kontrat No</div>
                  <div className="font-medium text-[var(--color-foreground)]">
                    {contractDetail.contract.contractId}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)] mb-1">Dönem</div>
                  <div className="font-medium text-[var(--color-foreground)]">
                    {contractDetail.contract.yearly ? "Yıllık" : "Aylık"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                <Calendar className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                <span className="text-sm text-[var(--color-muted-foreground)]">
                  {formatDate(contractDetail.contract.startDate)} - {formatDate(contractDetail.contract.endDate)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Price Comparison */}
        {contractDetail && groupedItems.size > 0 && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
                  <h2 className="font-semibold text-[var(--color-foreground)]">
                    Fiyat Karşılaştırması
                  </h2>
                </div>
                <div className="text-xs text-[var(--color-muted-foreground)]">
                  {contractDetail.summary.inflationSource}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {Array.from(groupedItems.entries()).map(([category, items]) => (
                <CategoryGroup
                  key={category}
                  category={category}
                  items={items}
                  defaultExpanded={groupedItems.size === 1}
                />
              ))}
            </div>
          </div>
        )}

        {/* Payment Summary */}
        {contractDetail && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
              <h2 className="font-semibold text-[var(--color-foreground)]">Ödeme Özeti</h2>
            </div>
            <div className="px-5 py-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted-foreground)]">Önceki Dönem Tutarı</span>
                  <span className="text-[var(--color-foreground)]">
                    {formatCurrency(contractDetail.summary.oldTotalTL)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted-foreground)]">Yeni Dönem Tutarı</span>
                  <span className="text-[var(--color-foreground)]">
                    {formatCurrency(contractDetail.summary.newTotalTL)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-muted-foreground)]">Artış Oranı</span>
                  <span className={`font-medium ${
                    contractDetail.summary.increaseRate > 0
                      ? "text-[var(--color-error)]"
                      : "text-[var(--color-success)]"
                  }`}>
                    {contractDetail.summary.increaseRate > 0 ? "+" : ""}
                    {contractDetail.summary.increaseRate.toFixed(1)}%
                  </span>
                </div>
                <div className="pt-3 mt-3 border-t border-[var(--color-border)]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[var(--color-foreground)]">Ödenecek Tutar</span>
                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      {formatCurrency(contractDetail.paymentAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[var(--color-primary)]" />
              <h2 className="font-semibold text-[var(--color-foreground)]">Ödeme Bilgileri</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <form
              ref={formRef}
              method="post"
              action={PAYTR_POST_URL}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input type="hidden" name="merchant_id" value={paymentInfo.merchantId} />
              <input type="hidden" name="user_ip" value={paymentInfo.userIp ?? ""} />
              <input type="hidden" name="email" value={paymentInfo.email} />
              <input type="hidden" name="payment_type" value={String(paymentInfo.paymentType ?? "card")} />
              <input type="hidden" name="payment_amount" value={String(paymentInfo.paymentAmount)} />
              <input type="hidden" name="currency" value={String(paymentInfo.currency ?? "TL")} />
              <input type="hidden" name="non_3d" value={String(paymentInfo.non3d ?? "0")} />
              <input type="hidden" name="paytr_token" value={String(paymentInfo.paytrToken)} />
              <input type="hidden" name="installment_count" value={String(paymentInfo.installmentCount ?? "1")} />
              <input type="hidden" name="merchant_oid" value={String(paymentInfo.id)} />
              <input type="hidden" name="store_card" value={storeCard} />
              <input type="hidden" name="card_type" value={String((paymentInfo as Record<string, unknown>).cardType ?? "")} />
              <input type="hidden" name="client_lang" value="tr" />
              <input type="hidden" name="user_name" value={String(paymentInfo.name ?? "")} />
              <input type="hidden" name="user_address" value="" />
              <input type="hidden" name="user_phone" value={String(paymentInfo.gsm ?? "")} />
              <input type="hidden" name="user_basket" value={userBasket} />
              <input type="hidden" name="merchant_ok_url" value={merchantOkUrl} />
              <input type="hidden" name="merchant_fail_url" value={merchantFailUrl} />
              <input type="hidden" name="card_number" value="" />

              {paymentInfo.canRecurring && (
                <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={storeCard === "1"}
                      onChange={(e) => setStoreCard(e.target.checked ? "1" : "0")}
                      className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    />
                    <span className="text-xs leading-relaxed text-[var(--color-muted-foreground)]">
                      Kerzz POS aylık kiralama/bakım ve diğer ücretler için
                      otomatik ödeme talimatı vermek istiyorum.
                      Kartım güvenle saklanacak ve ilerideki ödemeler için
                      kullanılacaktır.
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  Kart sahibi adı
                </label>
                <input
                  type="text"
                  name="cc_owner"
                  required
                  placeholder="Kart üzerindeki ad soyad"
                  className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  Kart numarası
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000-0000-0000-0000"
                  value={cardDisplay}
                  onChange={handleCardDisplayChange}
                  maxLength={19}
                  className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                    Ay
                  </label>
                  <input
                    type="tel"
                    name="expiry_month"
                    placeholder="AA"
                    inputMode="numeric"
                    maxLength={2}
                    required
                    className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                    Yıl
                  </label>
                  <input
                    type="tel"
                    name="expiry_year"
                    placeholder="YY"
                    inputMode="numeric"
                    maxLength={2}
                    required
                    className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                    CVV
                  </label>
                  <input
                    type="tel"
                    name="cvv"
                    placeholder="***"
                    inputMode="numeric"
                    maxLength={4}
                    required
                    className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSubmitting ? "Gönderiliyor…" : "Ödemeyi Başlat"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[var(--color-muted-foreground)] py-4">
          <p>Bu ödeme sayfası Kerzz tarafından sağlanmaktadır.</p>
          <p className="mt-1">Ödeme işlemi PayTR güvenli ödeme altyapısı ile gerçekleştirilmektedir.</p>
        </div>
      </div>
    </div>
  );
}
