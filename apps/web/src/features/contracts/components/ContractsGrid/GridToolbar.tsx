import { Eye } from "lucide-react";
import type { Contract } from "../../types";

interface GridToolbarProps {
  selectedContract: Contract | null;
  onInspect: () => void;
  disabled?: boolean;
}

export function GridToolbar({
  selectedContract,
  onInspect,
  disabled = false
}: GridToolbarProps) {
  const isDisabled = disabled || !selectedContract;

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-surface-elevated">
      <button
        onClick={onInspect}
        disabled={isDisabled}
        className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-subtle disabled:hover:bg-surface"
        title={selectedContract ? `${selectedContract.brand} kontratını incele` : "Bir kontrat seçin"}
      >
        <Eye className="h-4 w-4" />
        İncele
      </button>
      {selectedContract && (
        <span className="text-sm text-muted-foreground ml-2">
          Seçili: <span className="font-medium text-foreground">{selectedContract.brand}</span>
        </span>
      )}
    </div>
  );
}
