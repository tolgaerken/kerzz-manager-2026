import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { fetchLeads, useUpdateLead, leadKeys } from "../../leads";
import { fetchOffers, useUpdateOffer, offerKeys } from "../../offers";
import { fetchSales } from "../../sales";
import { SALES_CONSTANTS } from "../../sales/constants/sales.constants";
import { KANBAN_COLUMNS } from "../constants/kanban.constants";
import type { KanbanColumnConfig } from "../constants/kanban.constants";
import type { KanbanItem } from "../types/kanban.types";

const LARGE_LIMIT = 99999;

export function usePipelineKanban() {
  const updateLead = useUpdateLead();
  const updateOffer = useUpdateOffer();

  const results = useQueries({
    queries: [
      {
        queryKey: leadKeys.list({ page: 1, limit: LARGE_LIMIT, status: "all" }),
        queryFn: () => fetchLeads({ page: 1, limit: LARGE_LIMIT, status: "all" }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      },
      {
        queryKey: offerKeys.list({ limit: LARGE_LIMIT, status: "all" }),
        queryFn: () => fetchOffers({ limit: LARGE_LIMIT, status: "all" }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      },
      {
        queryKey: [SALES_CONSTANTS.QUERY_KEYS.SALES, { limit: LARGE_LIMIT, status: "completed" }],
        queryFn: () => fetchSales({ limit: LARGE_LIMIT, status: "completed" }),
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
      },
    ],
  });

  const [leadsQuery, offersQuery, salesQuery] = results;

  const items = useMemo<KanbanItem[]>(() => {
    const leadItems =
      leadsQuery.data?.data
        ?.filter((lead) =>
          ["new", "contacted", "qualified"].includes(lead.status)
        )
        .map((lead) => ({
          id: lead._id,
          columnId:
            lead.status === "new"
              ? "lead-new"
              : lead.status === "contacted"
                ? "lead-contacted"
                : "lead-qualified",
          entityType: "lead" as const,
          title: lead.companyName || lead.contactName || "Lead",
          subtitle: lead.assignedUserName || lead.contactName || "",
          value: lead.estimatedValue || 0,
          status: lead.status,
          raw: lead,
        })) || [];

    const offerItems =
      offersQuery.data?.data
        ?.filter((offer) => ["draft", "sent"].includes(offer.status))
        .map((offer) => ({
          id: offer._id,
          columnId: offer.status === "draft" ? "offer-draft" : "offer-sent",
          entityType: "offer" as const,
          title: offer.customerName || "Teklif",
          subtitle: offer.sellerName || "",
          value: offer.totals?.overallGrandTotal || 0,
          status: offer.status,
          raw: offer,
        })) || [];

    const saleItems =
      salesQuery.data?.data?.map((sale) => ({
        id: sale._id,
        columnId: "sale-won" as const,
        entityType: "sale" as const,
        title: sale.customerName || "Satış",
        subtitle: sale.sellerName || "",
        value: sale.grandTotal || 0,
        status: sale.status,
        raw: sale,
      })) || [];

    return [...leadItems, ...offerItems, ...saleItems];
  }, [leadsQuery.data, offersQuery.data, salesQuery.data]);

  const grouped = useMemo(() => {
    const map: Record<string, KanbanItem[]> = {};
    for (const column of KANBAN_COLUMNS) {
      map[column.id] = [];
    }
    for (const item of items) {
      map[item.columnId]?.push(item);
    }
    return map;
  }, [items]);

  const isLoading = results.some((query) => query.isLoading);
  const isFetching = results.some((query) => query.isFetching);
  const isError = results.some((query) => query.isError);
  const error = results.find((query) => query.error)?.error ?? null;

  const refetchAll = () => {
    results.forEach((query) => query.refetch());
  };

  const moveItem = async (item: KanbanItem, column: KanbanColumnConfig) => {
    if (item.entityType !== column.entityType) return;
    if (item.status === column.status) return;

    if (item.entityType === "lead") {
      await updateLead.mutateAsync({
        id: item.id,
        data: { status: column.status },
      });
    }

    if (item.entityType === "offer") {
      await updateOffer.mutateAsync({
        id: item.id,
        input: { status: column.status },
      });
    }
  };

  return {
    columns: KANBAN_COLUMNS,
    itemsByColumn: grouped,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: refetchAll,
    moveItem,
  };
}
