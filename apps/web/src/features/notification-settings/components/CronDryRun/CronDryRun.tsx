import { useState } from "react";
import { Play, RefreshCw, FileText, ScrollText, GitBranch, Bell, Receipt } from "lucide-react";
import { cronDryRunApi } from "../../api/cronDryRunApi";
import { useCronManualExecution, useCronManualRun } from "../../hooks";
import { DryRunResultPanel, type DryRunRunnableRecord } from "./DryRunResultPanel";
import {
  ManualCronExecutionPanel,
  type CronExecutionLogItem,
} from "./ManualCronExecutionPanel";
import type { CronName, CronDryRunResponse } from "../../types";

interface CronJobConfig {
  name: CronName;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const CRON_JOBS: CronJobConfig[] = [
  {
    name: "invoice-notification",
    label: "Fatura Bildirim",
    description: "Her gun 09:00 — Vadesi gelen/gecen fatura bildirimleri",
    icon: <FileText className="w-5 h-5 text-[var(--color-info)]" />,
  },
  {
    name: "contract-notification-monthly",
    label: "Aylık Kontrat Bildirim",
    description: "Her gun 09:30 — Bitis tarihi yaklasan aylik kontrat bildirimleri",
    icon: <ScrollText className="w-5 h-5 text-[var(--color-success)]" />,
  },
  {
    name: "contract-notification-yearly",
    label: "Yıllık Kontrat Bildirim",
    description: "Her gun 09:30 — Bitis tarihi yaklasan yillik kontrat bildirimleri",
    icon: <ScrollText className="w-5 h-5 text-[var(--color-success)]" />,
  },
  {
    name: "stale-pipeline",
    label: "Hareketsiz Pipeline",
    description: "Her gun 09:15 — 14 gundur guncellenmemis lead/teklif bildirimleri",
    icon: <GitBranch className="w-5 h-5 text-[var(--color-warning)]" />,
  },
  {
    name: "manager-log-reminder",
    label: "Log Hatirlatma",
    description: "Her 15 dakika — Zamani gelen manager log hatirlitmalari",
    icon: <Bell className="w-5 h-5 text-[var(--color-primary)]" />,
  },
  {
    name: "prorated-invoice",
    label: "Kist Fatura",
    description: "Her gun 09:00 — Faturasi kesilmemis kist odeme planlari",
    icon: <Receipt className="w-5 h-5 text-[var(--color-info)]" />,
  },
];

interface CronCardState {
  loading: boolean;
  result: CronDryRunResponse | null;
  error: string | null;
}

function CronJobCard({ config }: { config: CronJobConfig }) {
  const [state, setState] = useState<CronCardState>({
    loading: false,
    result: null,
    error: null,
  });
  const [selectedRecord, setSelectedRecord] = useState<DryRunRunnableRecord | null>(null);
  const [executionLogs, setExecutionLogs] = useState<CronExecutionLogItem[]>([]);
  const manualExecution = useCronManualExecution();
  const manualCronRun = useCronManualRun();

  const addLog = (level: CronExecutionLogItem["level"], message: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString("tr-TR", { hour12: false });
    setExecutionLogs((prev) => [
      ...prev,
      {
        id: `${now.getTime()}-${prev.length}`,
        timestamp,
        level,
        message,
      },
    ]);
  };

  const handleRun = async () => {
    setState({ loading: true, result: null, error: null });
    try {
      const result = await cronDryRunApi.run(config.name);
      setState({ loading: false, result, error: null });
    } catch (err) {
      setState({
        loading: false,
        result: null,
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    }
  };

  const handleRunRecord = async (record: DryRunRunnableRecord) => {
    setSelectedRecord(record);
    addLog("info", `Secilen kayit: ${record.label} (${record.cronName})`);

    try {
      if (record.payload.kind === "notification-send") {
        addLog(
          "info",
          `Istek hazirlaniyor -> items: [${record.payload.type}:${record.payload.id}], channels: [${record.payload.channels.join(", ")}]`
        );

        const response = await manualExecution.mutateAsync({
          type: record.payload.type,
          id: record.payload.id,
          channels: record.payload.channels,
        });

        addLog(
          "success",
          `Manuel cron tamamlandi -> basarili: ${response.sent}, basarisiz: ${response.failed}`
        );

        response.results.forEach((result) => {
          if (result.success) {
            addLog(
              "success",
              `Kanal=${result.channel} alici=${result.recipient ?? "-"} sonuc=OK`
            );
            return;
          }

          addLog(
            "error",
            `Kanal=${result.channel} alici=${result.recipient ?? "-"} hata=${result.error ?? "Bilinmeyen hata"}`
          );
        });
        return;
      }

      addLog(
        "info",
        `Cron manual-run istegi hazirlaniyor -> ${JSON.stringify(record.payload)}`
      );

      const response = await manualCronRun.mutateAsync({
        cronName: record.cronName,
        payload: {
          targetType: record.payload.targetType,
          contextId: record.payload.contextId,
          logId: record.payload.logId,
          planId: record.payload.planId,
        },
      });

      const level = response.success ? "success" : "error";
      addLog(
        level,
        `Manuel cron sonucu -> success=${response.success} skipped=${response.skipped} mesaj="${response.message}"`
      );

      if (response.details) {
        addLog("info", `Detay -> ${JSON.stringify(response.details)}`);
      }
    } catch (error) {
      addLog(
        "error",
        `Manuel cron hatasi: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`
      );
    }
  };

  const isRunning = manualExecution.isPending || manualCronRun.isPending;
  const runningRecordKey = isRunning ? selectedRecord?.key ?? null : null;

  return (
    <div className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-surface)]">
            {config.icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-[var(--color-foreground)]">
              {config.label}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {config.description}
            </p>
          </div>
        </div>

        <button
          onClick={handleRun}
          disabled={state.loading}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[var(--color-primary-foreground)] bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 ml-4"
        >
          {state.loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {state.loading ? "Calisiyor..." : "Testi Calistir"}
        </button>
      </div>

      {state.error && (
        <div className="mt-3 p-2.5 text-xs bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 rounded-md text-[var(--color-error)]">
          Hata: {state.error}
        </div>
      )}

      {state.result && (
        <div className="space-y-3">
          <DryRunResultPanel
            data={state.result}
            onRunRecord={handleRunRecord}
            runningRecordKey={runningRecordKey}
          />
          <ManualCronExecutionPanel
            selectedRecord={selectedRecord}
            logs={executionLogs}
            isRunning={isRunning}
            onClearLogs={() => setExecutionLogs([])}
          />
        </div>
      )}
    </div>
  );
}

export function CronDryRun() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="mb-2">
        <h2 className="text-sm font-medium text-[var(--color-foreground)]">
          Cron Test
        </h2>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          Cron job'lari gercek bildirim gondermeden veya kayit olusturmadan test edin. Sonuclar, cron calissaydi ne olacagini gosterir.
        </p>
      </div>

      {CRON_JOBS.map((config) => (
        <CronJobCard key={config.name} config={config} />
      ))}
    </div>
  );
}
