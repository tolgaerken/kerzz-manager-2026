import { useRef, useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { usePaymentInfo } from "../features/payments";

const PAYTR_POST_URL = "https://www.paytr.com/odeme";
const PAYMENT_BASE_URL =
  import.meta.env.VITE_PAYMENT_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");

export function PublicPaymentFormPage() {
  const params = useParams({ strict: false });
  const linkId = params?.linkId ?? null;
  const reset =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("reset") === "1";

  const { data: paymentInfo, isLoading, error } = usePaymentInfo(linkId);
  const [cardDisplay, setCardDisplay] = useState("");
  const [storeCard, setStoreCard] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (reset && paymentInfo) {
      setCardDisplay("");
    }
  }, [reset, paymentInfo]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-foreground-muted)]">Yükleniyor...</div>
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
          <p className="text-sm text-[var(--color-foreground-muted)]">
            {error?.message ?? "Link geçersiz veya süresi dolmuş olabilir."}
          </p>
        </div>
      </div>
    );
  }

  const merchantOkUrl = `${PAYMENT_BASE_URL}/payment_ok/${paymentInfo.id}`;
  const merchantFailUrl = `${PAYMENT_BASE_URL}/payment_error/${paymentInfo.id}`;
  const userBasket = btoa(
    unescape(encodeURIComponent(JSON.stringify([["Odeme", (paymentInfo.paymentAmount / 100).toFixed(2), 1]])))
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
              Güvenli Ödeme
            </h1>
            <p className="text-sm text-[var(--color-foreground-muted)] mt-0.5">
              PayTR ile 256-bit SSL koruması
            </p>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <span className="text-[var(--color-foreground-muted)]">Firma</span>
              <span className="text-[var(--color-foreground)] font-medium">
                {paymentInfo.customerName}
              </span>
              <span className="text-[var(--color-foreground-muted)]">Ad Soyad</span>
              <span className="text-[var(--color-foreground)]">{paymentInfo.name}</span>
              <span className="text-[var(--color-foreground-muted)]">Tutar</span>
              <span className="text-[var(--color-foreground)] font-medium">
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY"
                }).format(paymentInfo.paymentAmount)}
              </span>
            </div>

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
              <input type="hidden" name="card_type" value={String(paymentInfo.cardType ?? "")} />
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
                    <span className="text-xs leading-relaxed text-[var(--color-foreground-muted)]">
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
                  className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
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
                  className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] placeholder:text-[var(--color-foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
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
                {isSubmitting ? "Gönderiliyor…" : "Ödemeyi başlat"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
