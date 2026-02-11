import { type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerLookup } from "../features/lookup/hooks/useCustomerLookup";
import { useLicenseLookup } from "../features/lookup/hooks/useLicenseLookup";
import { useMongoChangeStream } from "../hooks/useMongoChangeStream";
import { LOOKUP_QUERY_KEYS } from "../features/lookup/constants";
import { useAuthStore } from "../features/auth/store/authStore";

interface LookupProviderProps {
  children: ReactNode;
}

/**
 * Uygulama açılışında müşteri ve lisans lookup verilerini prefetch eder.
 * MongoDB change stream ile DB değişikliklerini dinleyerek cache'i otomatik günceller.
 * Sadece kullanıcı giriş yaptıysa veri çeker.
 */
export function LookupProvider({ children }: LookupProviderProps) {
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.authStatus);

  // Uygulama açılışında verileri çek (prefetch) - sadece login olduysa
  useCustomerLookup({ enabled: authStatus });
  useLicenseLookup({ enabled: authStatus });

  // MongoDB change stream ile müşteri değişikliklerini dinle - sadece login olduysa
  useMongoChangeStream(
    "customers",
    () => {
      queryClient.invalidateQueries({ queryKey: [...LOOKUP_QUERY_KEYS.CUSTOMERS] });
    },
    { enabled: authStatus }
  );

  // MongoDB change stream ile lisans değişikliklerini dinle - sadece login olduysa
  useMongoChangeStream(
    "licenses",
    () => {
      queryClient.invalidateQueries({ queryKey: [...LOOKUP_QUERY_KEYS.LICENSES] });
    },
    { enabled: authStatus }
  );

  return <>{children}</>;
}
