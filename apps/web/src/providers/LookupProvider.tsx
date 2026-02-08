import { type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomerLookup } from "../features/lookup/hooks/useCustomerLookup";
import { useLicenseLookup } from "../features/lookup/hooks/useLicenseLookup";
import { useMongoChangeStream } from "../hooks/useMongoChangeStream";
import { LOOKUP_QUERY_KEYS } from "../features/lookup/constants";

interface LookupProviderProps {
  children: ReactNode;
}

/**
 * Uygulama açılışında müşteri ve lisans lookup verilerini prefetch eder.
 * MongoDB change stream ile DB değişikliklerini dinleyerek cache'i otomatik günceller.
 */
export function LookupProvider({ children }: LookupProviderProps) {
  const queryClient = useQueryClient();

  // Uygulama açılışında verileri çek (prefetch)
  useCustomerLookup();
  useLicenseLookup();

  // MongoDB change stream ile müşteri değişikliklerini dinle
  useMongoChangeStream("customers", () => {
    queryClient.invalidateQueries({ queryKey: [...LOOKUP_QUERY_KEYS.CUSTOMERS] });
  });

  // MongoDB change stream ile lisans değişikliklerini dinle
  useMongoChangeStream("licenses", () => {
    queryClient.invalidateQueries({ queryKey: [...LOOKUP_QUERY_KEYS.LICENSES] });
  });

  return <>{children}</>;
}
