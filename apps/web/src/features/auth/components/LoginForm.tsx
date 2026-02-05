import { useState, type FormEvent } from "react";

interface LoginFormProps {
  onRequestOtp: (gsm: string) => Promise<void>;
  onVerifyOtp: (gsm: string, otp: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

type LoginState = "gsm" | "otp";

function PhoneIcon() {
  return (
    <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function LoginForm({ onRequestOtp, onVerifyOtp, isLoading, error }: LoginFormProps) {
  const [state, setState] = useState<LoginState>("gsm");
  const [gsm, setGsm] = useState("");
  const [otp, setOtp] = useState("");

  async function handleGsmSubmit(e: FormEvent) {
    e.preventDefault();
    if (!gsm.trim()) return;

    try {
      await onRequestOtp(gsm);
      setState("otp");
    } catch {
      // Error is handled by parent
    }
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault();
    if (!otp.trim()) return;

    try {
      await onVerifyOtp(gsm, otp);
    } catch {
      // Error is handled by parent
    }
  }

  function handleBack() {
    setState("gsm");
    setOtp("");
  }

  return (
    <div className="w-full">
      {/* Glassmorphism Card */}
      <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-8 shadow-2xl backdrop-blur-xl">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-error/10 px-4 py-3 text-error ring-1 ring-error/20">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* GSM Form */}
        {state === "gsm" && (
          <form onSubmit={handleGsmSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="gsm" className="block text-sm font-semibold text-muted-foreground">
                Telefon Numarası
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <PhoneIcon />
                </div>
                <input
                  id="gsm"
                  type="tel"
                  value={gsm}
                  onChange={(e) => setGsm(e.target.value)}
                  placeholder="5XX XXX XX XX"
                  className="w-full rounded-xl border border-foreground/10 bg-foreground/5 py-4 pl-12 pr-4 text-foreground placeholder-subtle transition-all duration-200 focus:border-primary focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                  autoComplete="tel"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !gsm.trim()}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent/80 to-primary/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Gönderiliyor...</span>
                  </>
                ) : (
                  "Doğrulama Kodu Gönder"
                )}
              </span>
            </button>
          </form>
        )}

        {/* OTP Form */}
        {state === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            {/* Back Button & Info */}
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeftIcon />
              <span>Numarayı Değiştir</span>
            </button>

            <div className="rounded-xl bg-accent/10 p-4 ring-1 ring-accent/20">
              <p className="text-center text-sm text-accent">
                <span className="font-semibold text-foreground">{gsm}</span> numarasına doğrulama kodu gönderildi
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-semibold text-muted-foreground">
                Doğrulama Kodu
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockIcon />
                </div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-foreground/10 bg-foreground/5 py-4 pl-12 pr-4 text-center text-xl font-bold tracking-[0.5em] text-foreground placeholder-subtle transition-all duration-200 focus:border-primary focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !otp.trim()}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-accent to-primary px-4 py-4 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-accent/80 to-primary/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span>Doğrulanıyor...</span>
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </span>
            </button>

            <p className="text-center text-sm text-subtle">
              Kod gelmedi mi?{" "}
              <button
                type="button"
                onClick={() => void onRequestOtp(gsm)}
                disabled={isLoading}
                className="font-medium text-primary transition-colors hover:text-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tekrar Gönder
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
