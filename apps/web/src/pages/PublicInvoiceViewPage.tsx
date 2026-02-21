import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "@tanstack/react-router";
import { useInvoiceCaptcha, useViewInvoicePdf } from "../features/invoice-view";

type ViewState = "captcha" | "loading" | "pdf" | "error";

export function PublicInvoiceViewPage() {
  const params = useParams({ strict: false });
  const invoiceUuid = params?.invoiceUuid ?? null;

  const [viewState, setViewState] = useState<ViewState>("captcha");
  const [captchaInput, setCaptchaInput] = useState(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfData, setPdfData] = useState<{ pdf: string; invoiceNumber: string; customerName: string } | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { data: captchaData, isLoading: captchaLoading, error: captchaError, refetch: refetchCaptcha } = useInvoiceCaptcha(invoiceUuid);
  const viewPdfMutation = useViewInvoicePdf(invoiceUuid ?? "");

  useEffect(() => {
    if (captchaData && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [captchaData]);

  const handleInputChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    
    setCaptchaInput((prev) => {
      const newInput = [...prev];
      newInput[index] = digit;
      return newInput;
    });

    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !captchaInput[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [captchaInput]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    
    if (pastedData.length === 4) {
      setCaptchaInput(pastedData.split(""));
      inputRefs.current[3]?.focus();
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = captchaInput.join("");
    if (code.length !== 4 || !captchaData?.challengeId) {
      setErrorMessage("Lütfen 4 haneli kodu girin");
      return;
    }

    setViewState("loading");
    setErrorMessage("");

    try {
      const result = await viewPdfMutation.mutateAsync({
        challengeId: captchaData.challengeId,
        code,
      });
      setPdfData(result);
      setViewState("pdf");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Doğrulama başarısız");
      setViewState("captcha");
      setCaptchaInput(["", "", "", ""]);
      await refetchCaptcha();
      inputRefs.current[0]?.focus();
    }
  }, [captchaInput, captchaData?.challengeId, viewPdfMutation, refetchCaptcha]);

  const handleDownload = useCallback(() => {
    if (!pdfData?.pdf) return;

    const byteCharacters = atob(pdfData.pdf);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatura-${pdfData.invoiceNumber || invoiceUuid}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfData, invoiceUuid]);

  if (!invoiceUuid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            Geçersiz Link
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Fatura görüntüleme linki geçersiz.
          </p>
        </div>
      </div>
    );
  }

  if (captchaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-[var(--color-muted-foreground)]">Yükleniyor...</div>
      </div>
    );
  }

  if (captchaError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] p-4">
        <div className="max-w-md w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 text-center">
          <h1 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
            Fatura Bulunamadı
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {captchaError.message || "Fatura bulunamadı veya link geçersiz."}
          </p>
        </div>
      </div>
    );
  }

  if (viewState === "pdf" && pdfData) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
                  E-Fatura
                </h1>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
                  {pdfData.customerName} - {pdfData.invoiceNumber}
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                İndir
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={`data:application/pdf;base64,${pdfData.pdf}`}
                className="w-full h-[80vh] rounded border border-[var(--color-border)]"
                title="Fatura PDF"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
              E-Fatura Görüntüleme
            </h1>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">
              Faturayı görüntülemek için güvenlik kodunu girin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="text-center">
              <p className="text-sm text-[var(--color-muted-foreground)] mb-4">
                Aşağıdaki 4 haneli kodu girin:
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)]">
                <span className="text-2xl font-mono font-bold tracking-[0.5em] text-[var(--color-foreground)]">
                  {captchaData?.code || "----"}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={captchaInput[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={viewState === "loading"}
                  className="w-14 h-14 text-center text-2xl font-mono font-bold rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-50"
                />
              ))}
            </div>

            {errorMessage && (
              <div className="text-center">
                <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={viewState === "loading" || captchaInput.join("").length !== 4}
              className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {viewState === "loading" ? "Doğrulanıyor..." : "Faturayı Görüntüle"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
