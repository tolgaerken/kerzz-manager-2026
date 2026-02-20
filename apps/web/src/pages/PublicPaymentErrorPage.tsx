import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { usePaymentInfo, usePaymentStatusWatcher } from "../features/payments";
import { useEffect } from "react";

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

export function PublicPaymentErrorPage() {
  const params = useParams({ strict: false });
  const id = params?.id ?? null;
  const navigate = useNavigate();
  const { data: paymentInfo, isLoading, error } = usePaymentInfo(id ?? null);

  const watchResult = usePaymentStatusWatcher({
    documentId: paymentInfo?.linkId ?? paymentInfo?.id ?? id,
    initialStatus: paymentInfo?.status,
    timeoutMs: 30_000,
    enabled: !!paymentInfo && paymentInfo.status === "waiting",
  });

  useEffect(() => {
    if (watchResult.status === "success" || watchResult.paymentStatus === "success") {
      navigate({
        to: "/payment_ok/$id",
        params: { id: paymentInfo?.linkId ?? id ?? "" },
      });
    }
  }, [watchResult.status, watchResult.paymentStatus, navigate, paymentInfo?.linkId, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-foreground-muted)]">Yukleniyor...</div>
      </div>
    );
  }

  const isWaiting =
    paymentInfo?.status === "waiting" &&
    (watchResult.status === "watching" ||
      watchResult.status === "connecting" ||
      watchResult.status === "idle");

  if (isWaiting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm p-8 text-center">
          <LoadingSpinner />
          <h1 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
            Odeme durumu kontrol ediliyor
          </h1>
          <p className="text-sm text-[var(--color-foreground-muted)] mb-6">
            Lutfen bekleyin...
          </p>
        </div>
      </div>
    );
  }

  const errorMessage =
    watchResult.statusMessage ??
    error?.message ??
    paymentInfo?.statusMessage ??
    "Odemeniz tamamlanamadi. Lutfen tekrar deneyin.";

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
          params={{ linkId: paymentInfo?.linkId ?? id ?? "" }}
          search={{ reset: "1" }}
          className="inline-block px-6 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          Tekrar dene
        </Link>
      </div>
    </div>
  );
}
