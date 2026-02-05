import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../store/authStore";

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const authStatus = useAuthStore((state) => state.authStatus);

  useEffect(() => {
    if (!authStatus) {
      void navigate({ to: "/login" });
    }
  }, [authStatus, navigate]);

  if (!authStatus) {
    return null;
  }

  return <>{children}</>;
}
