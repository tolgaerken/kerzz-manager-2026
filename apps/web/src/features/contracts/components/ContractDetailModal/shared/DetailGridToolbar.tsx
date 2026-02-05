import { Plus, Trash2, Loader2 } from "lucide-react";

interface DetailGridToolbarProps {
  onAdd: () => void;
  onDelete: () => void;
  canDelete: boolean;
  loading?: boolean;
  addLabel?: string;
  deleteLabel?: string;
}

export function DetailGridToolbar({
  onAdd,
  onDelete,
  canDelete,
  loading = false,
  addLabel = "Ekle",
  deleteLabel = "Sil"
}: DetailGridToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-elevated">
      <button
        onClick={onAdd}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {addLabel}
      </button>

      <button
        onClick={onDelete}
        disabled={!canDelete || loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-border text-muted-foreground hover:text-error hover:border-error disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        {deleteLabel}
      </button>
    </div>
  );
}
