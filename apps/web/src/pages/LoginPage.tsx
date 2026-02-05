import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth, LoginForm } from "../features/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { authStatus, isLoading, error, autoLogin, requestOtp, verifyOtp, setError } = useAuth();

  useEffect(() => {
    if (authStatus) {
      void navigate({ to: "/dashboard" });
      return;
    }

    void autoLogin().then((success) => {
      if (success) {
        void navigate({ to: "/dashboard" });
      }
    });
  }, [authStatus, autoLogin, navigate]);

  async function handleRequestOtp(gsm: string) {
    setError(null);
    await requestOtp(gsm);
  }

  async function handleVerifyOtp(gsm: string, otp: string) {
    setError(null);
    await verifyOtp(gsm, otp);
    void navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/10 to-background">
      {/* Animated background blobs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 animate-blob rounded-full bg-accent opacity-20 mix-blend-multiply blur-3xl" />
      <div className="animation-delay-2000 absolute -right-40 top-20 h-80 w-80 animate-blob rounded-full bg-primary opacity-20 mix-blend-multiply blur-3xl" />
      <div className="animation-delay-4000 absolute -bottom-40 left-20 h-80 w-80 animate-blob rounded-full bg-error opacity-20 mix-blend-multiply blur-3xl" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-40" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo & Branding */}
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary shadow-lg shadow-primary/30">
            <svg
              className="h-10 w-10 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
            Kerzz Manager
          </h1>
          <p className="text-lg text-muted">
            Devam etmek için giriş yapın
          </p>
        </div>

        <LoginForm
          onRequestOtp={handleRequestOtp}
          onVerifyOtp={handleVerifyOtp}
          isLoading={isLoading}
          error={error}
        />

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-subtle">
          © 2026 Kerzz. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
