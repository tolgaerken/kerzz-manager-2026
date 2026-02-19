import { useMemo, useCallback, useState } from "react";
import { Grid, type GridColumnDef, type ToolbarConfig } from "@kerzz/grid";
import { Eye, MessageSquare, Contact, AlertTriangle, CheckCircle, Mail, Send } from "lucide-react";
import { yearlyContractQueueColumnDefs } from "./columnDefs";
import { ContactInfoModal } from "../ContactInfoModal";
import {
  hasMatchingCondition,
  getConditionLabel,
} from "../../utils";
import type { QueueContractItem, QueueCustomer, ContractMilestone } from "../../types";

interface YearlyContractQueueGridProps {
  data: QueueContractItem[];
  loading: boolean;
  onSelectionChanged: (items: QueueContractItem[]) => void;
  onPreviewEmail: (id: string) => void;
  onPreviewSms: (id: string) => void;
  onSendEmail: () => void;
  onSendSms: () => void;
  onSendAll: () => void;
  globalSelectedCount: number;
  isSending: boolean;
}

function getYearlyTemplateCode(milestone: ContractMilestone | null): string {
  switch (milestone) {
    case "post-1":
      return "contract-renewal-overdue-1-email";
    case "post-3":
      return "contract-renewal-overdue-3-email";
    case "post-5":
      return "contract-renewal-overdue-5-email";
    case "pre-expiry":
    default:
      return "contract-renewal-pre-expiry-email";
  }
}

export function YearlyContractQueueGrid({
  data,
  loading,
  onSelectionChanged,
  onPreviewEmail,
  onPreviewSms,
  onSendEmail,
  onSendSms,
  onSendAll,
  globalSelectedCount,
  isSending,
}: YearlyContractQueueGridProps) {
  const [contactCustomer, setContactCustomer] = useState<QueueCustomer | null>(null);

  const toolbarConfig = useMemo<ToolbarConfig<QueueContractItem>>(() => {
    const isDisabled = globalSelectedCount === 0 || isSending;
    return {
      showSearch: true,
      showExcelExport: true,
      showPdfExport: true,
      showColumnVisibility: true,
      exportFileName: "yillik-kontrat-bildirimleri",
      customButtons: [
        {
          id: "send-email",
          label: "E-posta Gönder",
          icon: <Mail className="w-4 h-4" />,
          onClick: onSendEmail,
          disabled: isDisabled,
        },
        {
          id: "send-sms",
          label: "SMS Gönder",
          icon: <MessageSquare className="w-4 h-4" />,
          onClick: onSendSms,
          disabled: isDisabled,
        },
        {
          id: "send-all",
          label: "Tümünü Gönder",
          icon: <Send className="w-4 h-4" />,
          onClick: onSendAll,
          disabled: isDisabled,
          variant: "primary",
        },
      ],
    };
  }, [globalSelectedCount, isSending, onSendEmail, onSendSms, onSendAll]);

  const columns = useMemo<GridColumnDef<QueueContractItem>[]>(
    () => [
      ...yearlyContractQueueColumnDefs,
      {
        id: "notifyStatus",
        header: "Bildirim",
        width: 100,
        cell: (_value, row) => {
          const currentCondition = getYearlyTemplateCode(row.milestone);
          const hasDuplicate = hasMatchingCondition(row.sentConditions, currentCondition);

          if (hasDuplicate) {
            return (
              <div
                title={`Bu koşul için daha önce bildirim gönderilmiş: ${getConditionLabel(currentCondition)}`}
                className="flex items-center gap-1.5 text-[var(--color-warning)]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">Gönderildi</span>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Bekliyor</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "İşlemler",
        width: 100,
        sortable: false,
        cell: (_value, row) => (
          <div className="flex items-center gap-1 h-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContactCustomer(row.customer);
              }}
              title="İletişim Bilgileri"
              className="p-1.5 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-hover)] rounded transition-colors"
            >
              <Contact className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewEmail(row.id);
              }}
              title="E-posta Önizleme"
              className="p-1.5 text-[var(--color-info)] hover:bg-[var(--color-info)]/10 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreviewSms(row.id);
              }}
              title="SMS Önizleme"
              className="p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success)]/10 rounded transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [onPreviewEmail, onPreviewSms, setContactCustomer],
  );

  const handleSelectionChange = useCallback(
    (selectedIds: string[]) => {
      const items = selectedIds
        .map((id) => data.find((item) => item.id === id))
        .filter((item): item is QueueContractItem => item !== undefined);
      onSelectionChanged(items);
    },
    [data, onSelectionChanged],
  );

  return (
    <div className="h-full w-full flex-1">
      <ContactInfoModal
        isOpen={contactCustomer !== null}
        customer={contactCustomer}
        onClose={() => setContactCustomer(null)}
      />
      <Grid<QueueContractItem>
        data={data}
        columns={columns}
        loading={loading}
        height="100%"
        locale="tr"
        getRowId={(row) => row.id}
        selectionMode="multiple"
        selectionCheckbox
        onSelectionChange={handleSelectionChange}
        stateKey="yearly-contract-queue-grid"
        toolbar={toolbarConfig}
      />
    </div>
  );
}
