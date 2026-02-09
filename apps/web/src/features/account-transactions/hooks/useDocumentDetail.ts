import { useQuery } from "@tanstack/react-query";
import { fetchDocumentDetail } from "../api";
import { ACCOUNT_TRANSACTIONS_CONSTANTS } from "../constants/accountTransactions.constants";
import type { AccountTransactionsQueryParams } from "../types";

export function useDocumentDetail(
  documentId: string,
  params: AccountTransactionsQueryParams,
  enabled = true
) {
  return useQuery({
    queryKey: [
      ACCOUNT_TRANSACTIONS_CONSTANTS.QUERY_KEYS.DOCUMENT_DETAIL,
      documentId,
      params,
    ],
    queryFn: () => fetchDocumentDetail(documentId, params),
    enabled: enabled && !!documentId,
    staleTime: 5 * 60 * 1000, // 5 dakika
  });
}
