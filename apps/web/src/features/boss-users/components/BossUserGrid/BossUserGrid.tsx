import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid } from "@kerzz/grid";
import type { ToolbarButtonConfig, ToolbarConfig } from "@kerzz/grid";
import { RefreshCw, Plus } from "lucide-react";
import { GRID_STATE_KEY } from "../../constants";
import { createBossUserColumnDefs, createActionsColumn } from "./columnDefs";
import { useCustomerLookup } from "../../../lookup";
import type { BossLicenseUser } from "../../types";

interface RoleInfo {
  id: string;
  name: string;
}

const normalizeRoleKey = (value: string): string => value.trim().toLowerCase();

interface BossUserGridProps {
  data: BossLicenseUser[];
  loading: boolean;
  roles?: RoleInfo[];
  onRefresh: () => void;
  onAddNew: () => void;
  onEdit: (license: BossLicenseUser) => void;
  onBlock: (license: BossLicenseUser) => void;
  onInfo: (license: BossLicenseUser) => void;
  onUnblock: (license: BossLicenseUser) => void;
  onDelete: (license: BossLicenseUser) => void;
}

export function BossUserGrid({
  data,
  loading,
  roles = [],
  onRefresh,
  onAddNew,
  onEdit,
  onBlock,
  onInfo,
  onUnblock,
  onDelete
}: BossUserGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  const { getCustomerName } = useCustomerLookup();

  // Rol ID -> Name map'i oluştur
  const roleMap = useMemo(() => {
    const map = new Map<string, string>();
    roles.forEach((role) => {
      map.set(role.id, role.name);
      map.set(role.name, role.name); // name ile de eşleştir (eski veriler için)
      map.set(normalizeRoleKey(role.id), role.name);
      map.set(normalizeRoleKey(role.name), role.name);
    });
    return map;
  }, [roles]);

  // Container yüksekliğini izle
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Aksiyon kolonunu oluştur
  const actionsColumn = useMemo(
    () =>
      createActionsColumn({
        onEdit,
        onBlock,
        onInfo,
        onUnblock,
        onDelete
      }),
    [onEdit, onBlock, onInfo, onUnblock, onDelete]
  );

  // Tüm kolonları birleştir (rol map'i ile)
  const columns = useMemo(
    () => [...createBossUserColumnDefs(roleMap, getCustomerName), actionsColumn],
    [roleMap, getCustomerName, actionsColumn]
  );

  // Çift tıklama handler
  const handleRowDoubleClick = useCallback(
    (row: BossLicenseUser) => {
      onEdit(row);
    },
    [onEdit]
  );

  // Toolbar butonları
  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni Kullanıcı",
        icon: <Plus className="h-4 w-4" />,
        variant: "primary",
        onClick: onAddNew
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw className="h-4 w-4" />,
        onClick: onRefresh
      }
    ],
    [onAddNew, onRefresh]
  );

  // Toolbar config
  const toolbarConfig: ToolbarConfig<BossLicenseUser> = useMemo(
    () => ({
      showSearch: true,
      showColumnVisibility: true,
      showExcelExport: true,
      showPdfExport: false,
      exportFileName: "kerzz-boss-kullanicilari",
      customButtons: toolbarButtons
    }),
    [toolbarButtons]
  );

  return (
    <div ref={containerRef} className="h-full w-full flex-1">
      <Grid<BossLicenseUser>
        data={data}
        columns={columns}
        locale="tr"
        height={containerHeight}
        loading={loading}
        getRowId={(row) => row.id}
        onRowDoubleClick={handleRowDoubleClick}
        toolbar={toolbarConfig}
        stateKey={GRID_STATE_KEY}
        stateStorage="localStorage"
        stripedRows
      />
    </div>
  );
}
