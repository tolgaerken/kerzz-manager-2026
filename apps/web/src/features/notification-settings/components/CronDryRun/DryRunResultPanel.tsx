import { Loader2, PlayCircle } from "lucide-react";
import type {
  CronName,
  CronDryRunResponse,
  InvoiceNotificationDryRunResponse,
  ContractNotificationDryRunResponse,
  StalePipelineDryRunResponse,
  ManagerLogReminderDryRunResponse,
  ProratedInvoiceDryRunResponse,
} from "../../types";

export interface DryRunRunnableRecord {
  key: string;
  cronName: CronName;
  label: string;
  payload:
    | {
        kind: "notification-send";
        type: "invoice" | "contract";
        id: string;
        channels: ("email" | "sms")[];
      }
    | {
        kind: "cron-manual-run";
        targetType?: "lead" | "offer";
        contextId?: string;
        logId?: string;
        planId?: string;
      };
}

function RunButton({
  runnable,
  isRunning,
  onClick,
}: {
  runnable: boolean;
  isRunning: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!runnable || isRunning}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-primary)]/40 px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:text-[var(--color-muted-foreground)] disabled:hover:bg-transparent"
    >
      {isRunning ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <PlayCircle className="h-3.5 w-3.5" />
      )}
      Manuel
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg p-3">
      <div className="text-xs text-[var(--color-muted-foreground)]">{label}</div>
      <div className="text-lg font-semibold text-[var(--color-foreground)] mt-0.5">
        {value}
      </div>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: "email" | "sms" }) {
  return (
    <span
      className={`inline-flex px-1.5 py-0.5 text-xs rounded ${
        channel === "email"
          ? "bg-[var(--color-info)]/10 text-[var(--color-info)]"
          : "bg-[var(--color-success)]/10 text-[var(--color-success)]"
      }`}
    >
      {channel === "email" ? "Email" : "SMS"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
      Bu cron calistiginda islenecek kayit bulunamadi.
    </div>
  );
}

// ── Invoice ──
function InvoiceResult({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: InvoiceNotificationDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Vadesi Gelen" value={data.summary.totalInvoicesDue} />
        <StatCard label="Vadesi Gecmis" value={data.summary.totalInvoicesOverdue} />
        <StatCard label="Email" value={data.summary.byChannel.email} />
        <StatCard label="SMS" value={data.summary.byChannel.sms} />
      </div>

      <div className="text-xs text-[var(--color-muted-foreground)]">
        Hatirlatma gunleri: {data.settings.invoiceDueReminderDays.join(", ")} |
        Vadesi gecmis gunler: {data.settings.invoiceOverdueDays.join(", ")} |
        Lookback: {data.settings.invoiceLookbackDays} gun
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                <th className="pb-2 pr-3">Fatura No</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3 text-right">Tutar</th>
                <th className="pb-2 pr-3">Son Odeme</th>
                <th className="pb-2 pr-3">Gecikme</th>
                <th className="pb-2 pr-3">Durum</th>
                <th className="pb-2">Kanal</th>
                <th className="pb-2 pl-3 text-right">Test</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={`${item.invoiceId}-${i}`} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3 font-mono text-xs">{item.invoiceNumber}</td>
                  <td className="py-2 pr-3">{item.customerName || item.customerId}</td>
                  <td className="py-2 pr-3 text-right">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.grandTotal)}
                  </td>
                  <td className="py-2 pr-3">{item.dueDate}</td>
                  <td className="py-2 pr-3">
                    {item.overdueDays != null && item.overdueDays > 0 && (
                      <span className="text-[var(--color-error)]">{item.overdueDays} gun</span>
                    )}
                  </td>
                  <td className="py-2 pr-3">
                    <span className={`text-xs ${item.status === "overdue" ? "text-[var(--color-error)]" : "text-[var(--color-warning)]"}`}>
                      {item.status === "due" ? "Vadesi geldi" : "Gecmis"}
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      {item.notifications.map((n, j) => (
                        <ChannelBadge key={j} channel={n.channel} />
                      ))}
                      {item.skippedReason && (
                        <span className="text-xs text-[var(--color-error)]">{item.skippedReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pl-3 text-right">
                    {(() => {
                      const channels = Array.from(
                        new Set(item.notifications.map((n) => n.channel))
                      );
                      const contextId = item.notifications[0]?.contextId || item.invoiceId;
                      const runnable = channels.length > 0 && Boolean(contextId);
                      const recordKey = `invoice-notification:invoice:${contextId}`;
                      const isRunning = runningRecordKey === recordKey;

                      return (
                        <RunButton
                          runnable={runnable}
                          isRunning={isRunning}
                          onClick={() => {
                            if (!runnable || !contextId || !onRunRecord) return;
                            onRunRecord({
                              key: recordKey,
                              cronName: "invoice-notification",
                              label: item.invoiceNumber || item.invoiceId,
                              payload: {
                                kind: "notification-send",
                                type: "invoice",
                                id: contextId,
                                channels,
                              },
                            });
                          }}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Contract ──
function ContractResult({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: ContractNotificationDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Toplam Kontrat" value={data.summary.totalContracts} />
        <StatCard label="Email" value={data.summary.byChannel.email} />
        <StatCard label="SMS" value={data.summary.byChannel.sms} />
      </div>

      <div className="text-xs text-[var(--color-muted-foreground)]">
        Hatirlatma gunleri: bitis oncesi {data.settings.contractExpiryDays.join(", ")} gun
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                <th className="pb-2 pr-3">Kontrat</th>
                <th className="pb-2 pr-3">Sirket</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3">Bitis Tarihi</th>
                <th className="pb-2 pr-3">Kalan Gun</th>
                <th className="pb-2">Kanal</th>
                <th className="pb-2 pl-3 text-right">Test</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={`${item.contractId}-${i}`} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3 font-mono text-xs">{item.contractId}</td>
                  <td className="py-2 pr-3">{item.company}</td>
                  <td className="py-2 pr-3">{item.customerName}</td>
                  <td className="py-2 pr-3">{item.endDate}</td>
                  <td className="py-2 pr-3">
                    <span className={item.remainingDays <= 7 ? "text-[var(--color-error)] font-medium" : ""}>
                      {item.remainingDays} gun
                    </span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-1">
                      {item.notifications.map((n, j) => (
                        <ChannelBadge key={j} channel={n.channel} />
                      ))}
                      {item.skippedReason && (
                        <span className="text-xs text-[var(--color-error)]">{item.skippedReason}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pl-3 text-right">
                    {(() => {
                      const channels = Array.from(
                        new Set(item.notifications.map((n) => n.channel))
                      );
                      const contextId = item.notifications[0]?.contextId;
                      const runnable = channels.length > 0 && Boolean(contextId);
                      const recordKey = `contract-notification:contract:${contextId ?? item.contractId}`;
                      const isRunning = runningRecordKey === recordKey;

                      return (
                        <RunButton
                          runnable={runnable}
                          isRunning={isRunning}
                          onClick={() => {
                            if (!runnable || !contextId || !onRunRecord) return;
                            onRunRecord({
                              key: recordKey,
                              cronName: "contract-notification",
                              label: item.contractId || contextId,
                              payload: {
                                kind: "notification-send",
                                type: "contract",
                                id: contextId,
                                channels,
                              },
                            });
                          }}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Stale Pipeline ──
function StalePipelineResult({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: StalePipelineDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Hareketsiz Lead" value={data.summary.totalStaleLeads} />
        <StatCard label="Hareketsiz Teklif" value={data.summary.totalStaleOffers} />
        <StatCard label="Bildirim Olusturulacak" value={data.summary.totalNotificationsWouldCreate} />
        <StatCard label="Zaten Bildirilmis" value={data.summary.alreadyNotifiedCount} />
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                <th className="pb-2 pr-3">Tip</th>
                <th className="pb-2 pr-3">Isim</th>
                <th className="pb-2 pr-3">Kullanici</th>
                <th className="pb-2 pr-3">Mesaj</th>
                <th className="pb-2">Durum</th>
                <th className="pb-2 pl-3 text-right">Test</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs rounded ${
                      item.type === "lead"
                        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                        : "bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
                    }`}>
                      {item.type === "lead" ? "Lead" : "Teklif"}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.userId}</td>
                  <td className="py-2 pr-3 text-xs max-w-xs truncate">{item.message}</td>
                  <td className="py-2">
                    {item.alreadyNotified ? (
                      <span className="text-xs text-[var(--color-muted-foreground)]">Bildirilmis</span>
                    ) : (
                      <span className="text-xs text-[var(--color-success)]">Yeni</span>
                    )}
                  </td>
                  <td className="py-2 pl-3 text-right">
                    {(() => {
                      const recordKey = `stale-pipeline:${item.type}:${item.id}`;
                      const isRunning = runningRecordKey === recordKey;

                      return (
                        <RunButton
                          runnable={true}
                          isRunning={isRunning}
                          onClick={() => {
                            if (!onRunRecord) return;
                            onRunRecord({
                              key: recordKey,
                              cronName: "stale-pipeline",
                              label: item.name || item.id,
                              payload: {
                                kind: "cron-manual-run",
                                targetType: item.type,
                                contextId: item.id,
                              },
                            });
                          }}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Manager Log Reminder ──
function ManagerLogResult({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: ManagerLogReminderDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <StatCard label="Bekleyen Hatirlatma" value={data.summary.totalPendingReminders} />
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                <th className="pb-2 pr-3">Log ID</th>
                <th className="pb-2 pr-3">Yazar</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2">Mesaj</th>
                <th className="pb-2 pl-3 text-right">Test</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3 font-mono text-xs">{item.logId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.authorId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.customerId}</td>
                  <td className="py-2 text-xs max-w-sm truncate">{item.message}</td>
                  <td className="py-2 pl-3 text-right">
                    {(() => {
                      const recordKey = `manager-log-reminder:${item.logId}`;
                      const isRunning = runningRecordKey === recordKey;
                      return (
                        <RunButton
                          runnable={true}
                          isRunning={isRunning}
                          onClick={() => {
                            if (!onRunRecord) return;
                            onRunRecord({
                              key: recordKey,
                              cronName: "manager-log-reminder",
                              label: item.logId,
                              payload: {
                                kind: "cron-manual-run",
                                logId: item.logId,
                              },
                            });
                          }}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Prorated Invoice ──
function ProratedResult({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: ProratedInvoiceDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Faturasi Kesilmemis Plan" value={data.summary.totalUninvoicedPlans} />
        <StatCard label="Benzersiz Musteri" value={data.summary.uniqueCustomers} />
        <StatCard
          label="Toplam Tutar"
          value={new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(data.summary.totalAmount)}
        />
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted-foreground)]">
                <th className="pb-2 pr-3">Plan ID</th>
                <th className="pb-2 pr-3">Kontrat</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3 text-right">Tutar</th>
                <th className="pb-2 pr-3">Odeme Tarihi</th>
                <th className="pb-2">Aciklama</th>
                <th className="pb-2 pl-3 text-right">Test</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3 font-mono text-xs">{item.planId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.contractId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.customerId}</td>
                  <td className="py-2 pr-3 text-right">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(item.amount)}
                  </td>
                  <td className="py-2 pr-3">{item.payDate}</td>
                  <td className="py-2 text-xs max-w-xs truncate">{item.description}</td>
                  <td className="py-2 pl-3 text-right">
                    {(() => {
                      const recordKey = `prorated-invoice:${item.planId}`;
                      const isRunning = runningRecordKey === recordKey;
                      return (
                        <RunButton
                          runnable={true}
                          isRunning={isRunning}
                          onClick={() => {
                            if (!onRunRecord) return;
                            onRunRecord({
                              key: recordKey,
                              cronName: "prorated-invoice",
                              label: item.planId,
                              payload: {
                                kind: "cron-manual-run",
                                planId: item.planId,
                              },
                            });
                          }}
                        />
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ──
export function DryRunResultPanel({
  data,
  onRunRecord,
  runningRecordKey,
}: {
  data: CronDryRunResponse;
  onRunRecord?: (record: DryRunRunnableRecord) => void;
  runningRecordKey?: string | null;
}) {
  const executedDate = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(data.executedAt));

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Calistirilma: {executedDate}
        </span>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          Sure: {data.durationMs}ms
        </span>
      </div>

      {data.cronName === "invoice-notification" && (
        <InvoiceResult
          data={data}
          onRunRecord={onRunRecord}
          runningRecordKey={runningRecordKey}
        />
      )}
      {data.cronName === "contract-notification" && (
        <ContractResult
          data={data}
          onRunRecord={onRunRecord}
          runningRecordKey={runningRecordKey}
        />
      )}
      {data.cronName === "stale-pipeline" && (
        <StalePipelineResult
          data={data}
          onRunRecord={onRunRecord}
          runningRecordKey={runningRecordKey}
        />
      )}
      {data.cronName === "manager-log-reminder" && (
        <ManagerLogResult
          data={data}
          onRunRecord={onRunRecord}
          runningRecordKey={runningRecordKey}
        />
      )}
      {data.cronName === "prorated-invoice" && (
        <ProratedResult
          data={data}
          onRunRecord={onRunRecord}
          runningRecordKey={runningRecordKey}
        />
      )}
    </div>
  );
}
