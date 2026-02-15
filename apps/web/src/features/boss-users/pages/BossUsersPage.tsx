import { useCallback } from "react";
import toast from "react-hot-toast";
import { BossUserGrid } from "../components/BossUserGrid";
import { BossUserEditModal } from "../components/BossUserEditModal";
import { BossUserBlockDialog } from "../components/BossUserBlockDialog";
import { BossNotificationDialog } from "../components/BossNotificationDialog";
import {
  useBossLicenses,
  useDeleteLicense,
  useUnblockUser,
  useRefreshLicenses,
  useBossRoles
} from "../hooks/useBossUsers";
import { useBossUsersStore } from "../store/bossUsersStore";
import type { BossLicenseUser } from "../types";

export function BossUsersPage() {
  const { data: licenses = [], isLoading } = useBossLicenses();
  const { data: roles = [] } = useBossRoles();
  const deleteLicense = useDeleteLicense();
  const unblockUser = useUnblockUser();
  const refreshLicenses = useRefreshLicenses();

  const {
    isEditModalOpen,
    isBlockDialogOpen,
    isNotifyDialogOpen,
    selectedLicense,
    openEditModal,
    closeEditModal,
    openBlockDialog,
    closeBlockDialog,
    openNotifyDialog,
    closeNotifyDialog
  } = useBossUsersStore();

  // Yenile
  const handleRefresh = useCallback(() => {
    refreshLicenses();
    toast.success("Liste yenilendi");
  }, [refreshLicenses]);

  // Yeni kullanıcı ekle
  const handleAddNew = useCallback(() => {
    openEditModal();
  }, [openEditModal]);

  // Düzenle
  const handleEdit = useCallback(
    (license: BossLicenseUser) => {
      openEditModal(license);
    },
    [openEditModal]
  );

  // Engelle
  const handleBlock = useCallback(
    (license: BossLicenseUser) => {
      openBlockDialog(license);
    },
    [openBlockDialog]
  );

  // Bilgi gönder
  const handleInfo = useCallback(
    (license: BossLicenseUser) => {
      openNotifyDialog(license);
    },
    [openNotifyDialog]
  );

  // Engeli kaldır
  const handleUnblock = useCallback(
    async (license: BossLicenseUser) => {
      try {
        await unblockUser.mutateAsync(license.id);
        toast.success("Engel kaldırıldı");
      } catch (error) {
        toast.error("Engel kaldırılamadı");
      }
    },
    [unblockUser]
  );

  // Sil
  const handleDelete = useCallback(
    async (license: BossLicenseUser) => {
      if (!confirm(`"${license.user_name}" kullanıcısının lisansını silmek istediğinize emin misiniz?`)) {
        return;
      }
      try {
        await deleteLicense.mutateAsync(license.id);
        toast.success("Lisans silindi");
      } catch (error) {
        toast.error("Lisans silinemedi");
      }
    },
    [deleteLicense]
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            Kerzz Boss Kullanıcıları
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Kerzz Boss uygulaması kullanıcılarını yönetin
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 min-h-0">
        <BossUserGrid
          data={licenses}
          loading={isLoading}
          roles={roles}
          onRefresh={handleRefresh}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onBlock={handleBlock}
          onInfo={handleInfo}
          onUnblock={handleUnblock}
          onDelete={handleDelete}
        />
      </div>

      {/* Modals */}
      <BossUserEditModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        license={selectedLicense}
      />

      <BossUserBlockDialog
        open={isBlockDialogOpen}
        onClose={closeBlockDialog}
        license={selectedLicense}
      />

      <BossNotificationDialog
        open={isNotifyDialogOpen}
        onClose={closeNotifyDialog}
        license={selectedLicense}
      />
    </div>
  );
}
