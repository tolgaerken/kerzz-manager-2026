import type { GridColumnDef } from "@kerzz/grid";
import { Pencil, Ban, Info, ShieldOff, Trash2 } from "lucide-react";
import type { BossLicenseUser, ParsedStatusText } from "../../types";

/**
 * Tarih formatlama
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

/**
 * StatusText parse et
 */
const parseStatusText = (statusText: string | undefined): ParsedStatusText | null => {
  if (!statusText) return null;
  try {
    return JSON.parse(statusText);
  } catch {
    return null;
  }
};

/**
 * Engelli mi kontrol et
 */
const isBlocked = (license: BossLicenseUser): boolean => {
  const parsed = parseStatusText(license.statusText);
  return parsed?.type === "block";
};

/**
 * Aksiyon butonları için props
 */
export interface ActionHandlers {
  onEdit: (license: BossLicenseUser) => void;
  onBlock: (license: BossLicenseUser) => void;
  onInfo: (license: BossLicenseUser) => void;
  onUnblock: (license: BossLicenseUser) => void;
  onDelete: (license: BossLicenseUser) => void;
}

/**
 * Aksiyon kolonu oluştur
 */
export function createActionsColumn(handlers: ActionHandlers): GridColumnDef<BossLicenseUser> {
  return {
    id: "actions",
    header: "İşlemler",
    width: 180,
    sortable: false,
    resizable: false,
    hideable: false,
    cell: (_value: unknown, row: BossLicenseUser) => {
      const blocked = isBlocked(row);

      return (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            title="Düzenle"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onEdit(row);
            }}
            className="rounded p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
          >
            <Pencil className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>

          {!blocked && (
            <>
              <button
                type="button"
                title="Engelle"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onBlock(row);
                }}
                className="rounded p-1.5 transition-colors hover:bg-[var(--color-error)]/10"
              >
                <Ban className="h-4 w-4 text-[var(--color-error)]" />
              </button>

              <button
                type="button"
                title="Bilgi Gönder"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onInfo(row);
                }}
                className="rounded p-1.5 transition-colors hover:bg-[var(--color-warning)]/10"
              >
                <Info className="h-4 w-4 text-[var(--color-warning)]" />
              </button>
            </>
          )}

          {blocked && (
            <button
              type="button"
              title="Engeli Kaldır"
              onClick={(e) => {
                e.stopPropagation();
                handlers.onUnblock(row);
              }}
              className="rounded p-1.5 transition-colors hover:bg-[var(--color-success)]/10"
            >
              <ShieldOff className="h-4 w-4 text-[var(--color-success)]" />
            </button>
          )}

          <button
            type="button"
            title="Sil"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(row);
            }}
            className="rounded p-1.5 transition-colors hover:bg-[var(--color-error)]/10"
          >
            <Trash2 className="h-4 w-4 text-[var(--color-error)]" />
          </button>
        </div>
      );
    }
  };
}

/**
 * Rol ID'lerini isimlere çevir
 */
const mapRolesToNames = (roles: string[], roleMap: Map<string, string>): string[] => {
  return roles
    .flatMap((roleEntry) =>
      roleEntry
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
    )
    .map((roleId) => roleMap.get(roleId) || roleMap.get(roleId.toLowerCase()) || roleId);
};

/**
 * Grid kolon tanımları oluştur (rol map'i ile)
 */
export function createBossUserColumnDefs(
  roleMap: Map<string, string>,
  resolveCustomerName: (customerId: string | undefined) => string
): GridColumnDef<BossLicenseUser>[] {
  return [
    {
      id: "brand",
      header: "Lisans",
      accessorKey: "brand",
      minWidth: 180,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      cell: (value: unknown, row: BossLicenseUser) => {
        const blocked = isBlocked(row);
        const brand = (typeof value === "string" && value) || row.licance_id || "-";
        return (
          <span className={blocked ? "text-[var(--color-error)] line-through" : ""}>
            {brand}
          </span>
        );
      }
    },
    {
      id: "customer",
      header: "Müşteri",
      accessorFn: (row: BossLicenseUser) => {
        if (row.customerName) return row.customerName;
        return resolveCustomerName(row.customerId);
      },
      minWidth: 180,
      sortable: true,
      filter: { type: "dropdown", showCounts: true },
      cell: (value: unknown) => {
        const customerName = typeof value === "string" ? value : "-";
        return (
          <span className="text-[var(--color-foreground)]">
            {customerName || "-"}
          </span>
        );
      }
    },
    {
      id: "user_name",
      header: "Kullanıcı Adı",
      accessorKey: "user_name",
      minWidth: 180,
      sortable: true,
      filter: { type: "input" },
      cellClassName: "font-medium"
    },
    {
      id: "mail",
      header: "E-posta",
      accessorKey: "mail",
      minWidth: 200,
      sortable: true,
      filter: { type: "input" }
    },
    {
      id: "phone",
      header: "Telefon",
      accessorKey: "phone",
      width: 140,
      sortable: true,
      filter: { type: "input" },
      cellClassName: "font-mono text-xs"
    },
    {
      id: "roles",
      header: "Roller",
      accessorFn: (row: BossLicenseUser) => mapRolesToNames(row.roles || [], roleMap).join(", "),
      width: 150,
      sortable: false,
      filter: { type: "dropdown", showCounts: true },
      cell: (value: unknown) => {
        const roles = typeof value === "string" ? value : "";
        if (!roles) return "-";
        return (
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {roles}
          </span>
        );
      }
    },
    {
      id: "lastLoginDate",
      header: "Son Giriş",
      accessorKey: "lastLoginDate",
      width: 160,
      sortable: true,
      filter: { type: "dateTree" },
      cell: (value: unknown) => formatDate(typeof value === "string" ? value : null)
    },
    {
      id: "statusText",
      header: "Durum",
      accessorFn: (row: BossLicenseUser) => {
        const parsed = parseStatusText(row.statusText);
        if (!parsed) return "Aktif";
        return parsed.type === "block" ? "Engelli" : "Bilgi";
      },
      width: 120,
      sortable: false,
      filter: { type: "dropdown", showCounts: true },
      cell: (_value: unknown, row: BossLicenseUser) => {
        const parsed = parseStatusText(row.statusText);
        if (!parsed) {
          return (
            <span className="inline-flex items-center rounded-full border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-success)]">
              Aktif
            </span>
          );
        }
        if (parsed.type === "block") {
          return (
            <span className="inline-flex items-center rounded-full border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-error)]">
              Engelli
            </span>
          );
        }
        return (
          <span className="inline-flex items-center rounded-full border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-warning)]">
            Bilgi
          </span>
        );
      }
    }
  ];
}
