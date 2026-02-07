import { X, MessageSquare } from "lucide-react";

interface LogPanelHeaderProps {
  title?: string;
  onClose: () => void;
}

export function LogPanelHeader({ title, onClose }: LogPanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">
          {title || "Loglar"}
        </h3>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-surface transition-colors"
        aria-label="Kapat"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
}
