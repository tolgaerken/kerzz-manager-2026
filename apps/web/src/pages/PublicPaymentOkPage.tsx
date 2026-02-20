import { useParams, Link } from "@tanstack/react-router";
import { usePaymentInfo, usePaymentStatusWatcher } from "../features/payments";

function LoadingSpinner() {
  return (
    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-[var(--color-primary)] animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

function SuccessIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-[var(--color-success)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}

function ErrorIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-error)]/20 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-[var(--color-error)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}

function WarningIcon() {
  return (
    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-warning)]/20 flex items-center justify-center">
      <svg
        className="w-8 h-8 text-[var(--color-warning)]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  );
}

export function PublicPaymentOkPage() {
  const params = useParams({ strict: false });
  const id = params?.id ?? null;
  const { data: paymentInfo, isLoading, error } = usePaymentInfo(id ?? null);

  const watchResult = usePaymentStatusWatcher({
    documentId: paymentInfo?.linkId ?? paymentInfo?.id ?? id,
    initialStatus: paymentInfo?.status,
    timeoutMs: 60_000,
    enabled: !!paymentInfo && paymentInfo.status === "waiting",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-foreground-muted)]">Yukleniyor...</div>
      </div>
    );
  }

  if (error || !paymentInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            Bilgi alinamadi
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)]">
            {error?.message ?? "Odeme bilgisi yuklenemedi."}
          </p>
        </div>
      </div>
    );
  }

  const amountStr = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY"
  }).format(paymentInfo.paymentAmount);

  const effectiveStatus =
    watchResult.paymentStatus ?? paymentInfo.status;
  const isWaiting =
    effectiveStatus === "waiting" &&
    (watchResult.status === "watching" ||
      watchResult.status === "connecting" ||
      watchResult.status === "idle");
  const isSuccess = effectiveStatus === "success" || watchResult.status === "success";
  const isFailed = effectiveStatus === "failed" || watchResult.status === "failed";
  const isTimeout = watchResult.status === "timeout";

  if (isWaiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
          <LoadingSpinner />
          <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
            Odemeniz isleniyor
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
            Lutfen bekleyin, odeme durumu kontrol ediliyor...
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-[var(--color-foreground)]">
              <span className="text-[var(--color-foreground-muted)]">Tutar: </span>
              <strong>{amountStr}</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
          <WarningIcon />
          <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
            Durum alinamadi
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
            Odeme durumu alinamadi. Lutfen daha sonra kontrol edin veya destek ile iletisime gecin.
          </p>
          <div className="space-y-1 text-sm mb-6">
            <p className="text-[var(--color-foreground)]">
              <span className="text-[var(--color-foreground-muted)]">Tutar: </span>
              <strong>{amountStr}</strong>
            </p>
            <p className="text-[var(--color-foreground-muted)] font-mono text-xs">
              Islem no: {paymentInfo.id}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Sayfayi yenile
          </button>
        </div>
      </div>
    );
  }

  if (isFailed) {
    const errorMessage =
      watchResult.statusMessage ??
      paymentInfo.statusMessage ??
      "Odemeniz tamamlanamadi.";

    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
          <ErrorIcon />
          <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
            Odeme basarisiz
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
            {errorMessage}
          </p>
          <Link
            to="/odeme/$linkId"
            params={{ linkId: paymentInfo.linkId ?? id ?? "" }}
            search={{ reset: "1" }}
            className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Tekrar dene
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
      <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
        <SuccessIcon />
        <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          Odeme basarili
        </h1>
        <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
          Odemeniz alinmistir.
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-[var(--color-foreground)]">
            <span className="text-[var(--color-foreground-muted)]">Tutar: </span>
            <strong>{amountStr}</strong>
          </p>
          <p className="text-[var(--color-foreground-muted)] font-mono text-xs">
            Islem no: {paymentInfo.id}
          </p>
        </div>
      </div>
    </div>
  );
}
