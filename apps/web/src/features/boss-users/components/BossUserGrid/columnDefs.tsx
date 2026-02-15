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
                className="rounded p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Ban className="h-4 w-4 text-red-500" />
              </button>

              <button
                type="button"
                title="Bilgi Gönder"
                onClick={(e) => {
                  e.stopPropagation();
                  handlers.onInfo(row);
                }}
                className="rounded p-1.5 transition-colors hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
              >
                <Info className="h-4 w-4 text-yellow-500" />
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
              className="rounded p-1.5 transition-colors hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <ShieldOff className="h-4 w-4 text-green-500" />
            </button>
          )}

          <button
            type="button"
            title="Sil"
            onClick={(e) => {
              e.stopPropagation();
              handlers.onDelete(row);
            }}
            className="rounded p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
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
export function createBossUserColumnDefs(roleMap: Map<string, string>): GridColumnDef<BossLicenseUser>[] {
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
        const brand = (value as string) || row.licance_id || "-";
        return (
          <span className={blocked ? "text-red-500 line-through" : ""}>
            {brand}
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
        const roles = value as string;
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
      cell: (value: unknown) => formatDate(value as string)
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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Aktif
            </span>
          );
        }
        if (parsed.type === "block") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Engelli
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            Bilgi
          </span>
        );
      }
    }
  ];
}
