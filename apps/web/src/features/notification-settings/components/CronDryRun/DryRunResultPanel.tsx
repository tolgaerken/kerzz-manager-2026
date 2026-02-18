import type {
  CronDryRunResponse,
  InvoiceNotificationDryRunResponse,
  ContractNotificationDryRunResponse,
  StalePipelineDryRunResponse,
  ManagerLogReminderDryRunResponse,
  ProratedInvoiceDryRunResponse,
} from "../../types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-lg p-3">
      <div className="text-xs text-[var(--color-muted)]">{label}</div>
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
          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
          : "bg-green-100 dark:bg-green-900/30 text-green-600"
      }`}
    >
      {channel === "email" ? "Email" : "SMS"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="py-6 text-center text-sm text-[var(--color-muted)]">
      Bu cron calistiginda islenecek kayit bulunamadi.
    </div>
  );
}

// ── Invoice ──
function InvoiceResult({ data }: { data: InvoiceNotificationDryRunResponse }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Vadesi Gelen" value={data.summary.totalInvoicesDue} />
        <StatCard label="Vadesi Gecmis" value={data.summary.totalInvoicesOverdue} />
        <StatCard label="Email" value={data.summary.byChannel.email} />
        <StatCard label="SMS" value={data.summary.byChannel.sms} />
      </div>

      <div className="text-xs text-[var(--color-muted)]">
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
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 pr-3">Fatura No</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3 text-right">Tutar</th>
                <th className="pb-2 pr-3">Son Odeme</th>
                <th className="pb-2 pr-3">Gecikme</th>
                <th className="pb-2 pr-3">Durum</th>
                <th className="pb-2">Kanal</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
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
function ContractResult({ data }: { data: ContractNotificationDryRunResponse }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Toplam Kontrat" value={data.summary.totalContracts} />
        <StatCard label="Email" value={data.summary.byChannel.email} />
        <StatCard label="SMS" value={data.summary.byChannel.sms} />
      </div>

      <div className="text-xs text-[var(--color-muted)]">
        Hatirlatma gunleri: bitis oncesi {data.settings.contractExpiryDays.join(", ")} gun
      </div>

      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 pr-3">Kontrat</th>
                <th className="pb-2 pr-3">Sirket</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3">Bitis Tarihi</th>
                <th className="pb-2 pr-3">Kalan Gun</th>
                <th className="pb-2">Kanal</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
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
function StalePipelineResult({ data }: { data: StalePipelineDryRunResponse }) {
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
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 pr-3">Tip</th>
                <th className="pb-2 pr-3">Isim</th>
                <th className="pb-2 pr-3">Kullanici</th>
                <th className="pb-2 pr-3">Mesaj</th>
                <th className="pb-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3">
                    <span className={`inline-flex px-1.5 py-0.5 text-xs rounded ${
                      item.type === "lead"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                        : "bg-orange-100 dark:bg-orange-900/30 text-orange-600"
                    }`}>
                      {item.type === "lead" ? "Lead" : "Teklif"}
                    </span>
                  </td>
                  <td className="py-2 pr-3">{item.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.userId}</td>
                  <td className="py-2 pr-3 text-xs max-w-xs truncate">{item.message}</td>
                  <td className="py-2">
                    {item.alreadyNotified ? (
                      <span className="text-xs text-[var(--color-muted)]">Bildirilmis</span>
                    ) : (
                      <span className="text-xs text-[var(--color-success)]">Yeni</span>
                    )}
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
function ManagerLogResult({ data }: { data: ManagerLogReminderDryRunResponse }) {
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
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 pr-3">Log ID</th>
                <th className="pb-2 pr-3">Yazar</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2">Mesaj</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]/50">
                  <td className="py-2 pr-3 font-mono text-xs">{item.logId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.authorId}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{item.customerId}</td>
                  <td className="py-2 text-xs max-w-sm truncate">{item.message}</td>
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
function ProratedResult({ data }: { data: ProratedInvoiceDryRunResponse }) {
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
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-muted)]">
                <th className="pb-2 pr-3">Plan ID</th>
                <th className="pb-2 pr-3">Kontrat</th>
                <th className="pb-2 pr-3">Musteri</th>
                <th className="pb-2 pr-3 text-right">Tutar</th>
                <th className="pb-2 pr-3">Odeme Tarihi</th>
                <th className="pb-2">Aciklama</th>
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
export function DryRunResultPanel({ data }: { data: CronDryRunResponse }) {
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
        <span className="text-xs text-[var(--color-muted)]">
          Calistirilma: {executedDate}
        </span>
        <span className="text-xs text-[var(--color-muted)]">
          Sure: {data.durationMs}ms
        </span>
      </div>

      {data.cronName === "invoice-notification" && <InvoiceResult data={data} />}
      {data.cronName === "contract-notification" && <ContractResult data={data} />}
      {data.cronName === "stale-pipeline" && <StalePipelineResult data={data} />}
      {data.cronName === "manager-log-reminder" && <ManagerLogResult data={data} />}
      {data.cronName === "prorated-invoice" && <ProratedResult data={data} />}
    </div>
  );
}
