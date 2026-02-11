import { useState } from "react";
import { ChevronDown, ChevronRight, Users, FileText, ShoppingCart } from "lucide-react";
import { LogMessageItem } from "./LogMessageItem";
import type { Log } from "../../types";

interface PipelineLogSectionProps {
  title: string;
  type: "lead" | "offer" | "sale";
  logs: Log[];
  currentUserId: string;
  defaultExpanded?: boolean;
  highlightLogId?: string | null;
  onHighlightSeen?: () => void;
}

const SECTION_CONFIG = {
  lead: {
    icon: Users,
    color: "text-[var(--color-info)]",
    bgColor: "bg-[var(--color-info)]/10",
    borderColor: "border-[var(--color-info)]/30",
    label: "Lead",
  },
  offer: {
    icon: FileText,
    color: "text-[var(--color-warning)]",
    bgColor: "bg-[var(--color-warning)]/10",
    borderColor: "border-[var(--color-warning)]/30",
    label: "Teklif",
  },
  sale: {
    icon: ShoppingCart,
    color: "text-[var(--color-success)]",
    bgColor: "bg-[var(--color-success)]/10",
    borderColor: "border-[var(--color-success)]/30",
    label: "Satış",
  },
};

export function PipelineLogSection({
  title,
  type,
  logs,
  currentUserId,
  defaultExpanded = true,
  highlightLogId,
  onHighlightSeen,
}: PipelineLogSectionProps) {
  // Highlight edilecek log bu section'da mı kontrol et
  const hasHighlightedLog = highlightLogId ? logs.some(log => log._id === highlightLogId) : false;
  
  // Highlight edilecek log varsa section'ı aç
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hasHighlightedLog);
  const config = SECTION_CONFIG[type];
  const Icon = config.icon;

  // Logları tarihe göre sırala (yeniden eskiye)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={`border ${config.borderColor} rounded-lg overflow-hidden`}>
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between px-4 py-3 ${config.bgColor} hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <span className={`font-medium ${config.color}`}>{title}</span>
          <span className="text-xs text-muted-foreground">
            ({logs.length} log)
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 bg-surface">
          {sortedLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Bu aşamada henüz log yok
            </p>
          ) : (
            <div className="space-y-1">
              {sortedLogs.map((log) => (
                <LogMessageItem
                  key={log._id}
                  log={log}
                  isOwn={log.authorId === currentUserId}
                  highlighted={highlightLogId === log._id}
                  onHighlightSeen={onHighlightSeen}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
