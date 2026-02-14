import { useMemo, useCallback, useState } from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import { Plus, RefreshCw, Copy, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { Grid, type GridColumnDef, type ToolbarButtonConfig } from "@kerzz/grid";
import { useApiKeys, useDeleteApiKey, useRegenerateApiKey, useApplications } from "../../hooks";
import { useSsoManagementStore } from "../../store";
import type { TApiKey } from "../../types";

export function ApiKeyList() {
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());

  const { data: apiKeys = [], isLoading, refetch } = useApiKeys();
  const { data: applications = [] } = useApplications(true);
  const deleteApiKey = useDeleteApiKey();
  const regenerateApiKey = useRegenerateApiKey();

  const { openApiKeyForm, setSelectedApiKey } = useSsoManagementStore();

  const getAppName = useCallback(
    (appId: string) => applications.find((a) => a.id === appId)?.name || appId,
    [applications]
  );

  const toggleShowKey = useCallback((keyId: string) => {
    setShowKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("API anahtarı kopyalandı");
    } catch {
      toast.error("Kopyalama başarısız");
    }
  }, []);

  const handleRegenerate = useCallback(
    async (apiKey: TApiKey) => {
      if (
        !confirm("API anahtarını yenilemek istediğinize emin misiniz? Eski anahtar geçersiz olacak.")
      ) {
        return;
      }

      try {
        await regenerateApiKey.mutateAsync(apiKey.id);
        toast.success("API anahtarı yenilendi");
      } catch {
        toast.error("API anahtarı yenilenirken hata oluştu");
      }
    },
    [regenerateApiKey]
  );

  const handleEdit = useCallback(
    (apiKey: TApiKey) => {
      setSelectedApiKey(apiKey);
      openApiKeyForm({
        app_id: apiKey.app_id,
        name: apiKey.name,
        description: apiKey.description,
        api_key: apiKey.api_key
      });
    },
    [setSelectedApiKey, openApiKeyForm]
  );

  const handleDelete = useCallback(
    async (apiKey: TApiKey) => {
      if (!confirm(`"${apiKey.name}" API anahtarını silmek istediğinize emin misiniz?`)) {
        return;
      }

      try {
        await deleteApiKey.mutateAsync(apiKey.id);
        toast.success("API anahtarı başarıyla silindi");
      } catch {
        toast.error("API anahtarı silinirken bir hata oluştu");
      }
    },
    [deleteApiKey]
  );

  const handleAdd = useCallback(() => {
    setSelectedApiKey(null);
    openApiKeyForm();
  }, [setSelectedApiKey, openApiKeyForm]);

  const columns: GridColumnDef<TApiKey>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Anahtar Adı",
        accessorKey: "name",
        width: 200,
        sortable: true,
        resizable: true,
        filter: { type: "input", conditions: ["contains", "startsWith", "equals"] }
      },
      {
        id: "app_id",
        header: "Uygulama",
        accessorKey: "app_id",
        width: 180,
        sortable: true,
        resizable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value) => getAppName(value as string),
        cell: (value) => (
          <Chip label={getAppName(value as string)} size="small" variant="outlined" />
        )
      },
      {
        id: "api_key",
        header: "API Anahtarı",
        accessorKey: "api_key",
        width: 350,
        sortable: false,
        resizable: true,
        cell: (value, row) => {
          const isVisible = showKeys.has(row.id);
          const keyStr = value as string;
          const maskedKey = keyStr.substring(0, 8) + "..." + keyStr.substring(keyStr.length - 4);

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
              >
                {isVisible ? keyStr : maskedKey}
              </Typography>
              <Tooltip title={isVisible ? "Gizle" : "Göster"}>
                <IconButton size="small" onClick={() => toggleShowKey(row.id)}>
                  {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Kopyala">
                <IconButton size="small" onClick={() => copyToClipboard(keyStr)}>
                  <Copy size={14} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Yenile">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegenerate(row);
                  }}
                >
                  <RefreshCw size={14} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }
      },
      {
        id: "isActive",
        header: "Durum",
        accessorKey: "isActive",
        width: 100,
        align: "center",
        sortable: true,
        filter: { type: "dropdown", showCounts: true },
        filterDisplayFn: (value) => (value ? "Aktif" : "Pasif"),
        cell: (value) => (
          <Chip
            label={value ? "Aktif" : "Pasif"}
            color={value ? "success" : "default"}
            size="small"
          />
        )
      },
      {
        id: "_actions",
        header: "İşlemler",
        accessorKey: "id",
        width: 100,
        align: "center",
        sortable: false,
        cell: (_, row) => (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
              title="Düzenle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
            <button
              type="button"
              className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
              title="Sil"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" x2="10" y1="11" y2="17" />
                <line x1="14" x2="14" y1="11" y2="17" />
              </svg>
            </button>
          </div>
        )
      }
    ],
    [getAppName, showKeys, toggleShowKey, copyToClipboard, handleRegenerate, handleEdit, handleDelete]
  );

  const toolbarButtons: ToolbarButtonConfig[] = useMemo(
    () => [
      {
        id: "add",
        label: "Yeni API Anahtarı",
        icon: <Plus size={18} />,
        onClick: handleAdd,
        variant: "primary"
      },
      {
        id: "refresh",
        label: "Yenile",
        icon: <RefreshCw size={18} />,
        onClick: () => refetch(),
        variant: "secondary"
      }
    ],
    [handleAdd, refetch]
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">API Anahtarları</Typography>
      </Box>

      <div style={{ height: 600 }}>
        <Grid<TApiKey>
          data={apiKeys}
          columns={columns}
          loading={isLoading}
          height="100%"
          locale="tr"
          stateKey="sso-api-keys-grid"
          getRowId={(row) => row.id}
          onRowDoubleClick={handleEdit}
          toolbar={{
            customButtons: toolbarButtons,
            exportFileName: "api-anahtarlari"
          }}
        />
      </div>
    </Box>
  );
}

export default ApiKeyList;
