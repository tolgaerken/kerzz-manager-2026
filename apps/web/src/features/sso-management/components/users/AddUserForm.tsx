import { useState, useCallback } from "react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { SsoModal } from "../common";
import { UserSearchStep } from "./UserSearchStep";
import { CreateUserStep } from "./CreateUserStep";
import { useSsoManagementStore } from "../../store";
import { useAssignUser, useAddUser } from "../../hooks";
import type { TUser } from "../../types";

type Step = "search" | "create";

export function AddUserForm() {
  const [step, setStep] = useState<Step>("search");
  const [searchQuery, setSearchQuery] = useState("");

  const { isAddUserFormOpen, addUserFormAppId, closeAddUserForm } = useSsoManagementStore();
  const assignUserMutation = useAssignUser();
  const addUserMutation = useAddUser();

  const isPending = assignUserMutation.isPending || addUserMutation.isPending;

  const handleSelectUser = useCallback(
    async (user: TUser) => {
      if (!addUserFormAppId) {
        toast.error("Uygulama seçilmedi");
        return;
      }

      try {
        await assignUserMutation.mutateAsync({
          userId: user.id,
          userName: user.name
        });
        toast.success(`${user.name} uygulamaya eklendi`);
        handleClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Kullanıcı eklenirken bir hata oluştu";
        toast.error(errorMessage);
      }
    },
    [addUserFormAppId, assignUserMutation]
  );

  const handleCreateNew = useCallback((query: string) => {
    setSearchQuery(query);
    setStep("create");
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: { name: string; email: string; phone: string }) => {
      if (!addUserFormAppId) {
        toast.error("Uygulama seçilmedi");
        return;
      }

      try {
        const result = await addUserMutation.mutateAsync({
          name: data.name.trim(),
          email: data.email.trim() || undefined,
          phone: data.phone.trim() || undefined,
          appId: addUserFormAppId
        });

        if (result.isNewUser) {
          toast.success("Yeni kullanıcı oluşturuldu ve uygulamaya eklendi");
        } else {
          toast.success("Mevcut kullanıcı uygulamaya eklendi");
        }

        handleClose();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Kullanıcı eklenirken bir hata oluştu";
        toast.error(errorMessage);
      }
    },
    [addUserFormAppId, addUserMutation]
  );

  const handleBackToSearch = useCallback(() => {
    setStep("search");
  }, []);

  const handleClose = useCallback(() => {
    setStep("search");
    setSearchQuery("");
    closeAddUserForm();
  }, [closeAddUserForm]);

  return (
    <SsoModal
      open={isAddUserFormOpen}
      onClose={handleClose}
      title={step === "search" ? "Kullanıcı Ekle" : "Yeni Kullanıcı Oluştur"}
      actions={
        <Button
          onClick={handleClose}
          sx={{
            color: "var(--color-muted-foreground)",
            "&:hover": { backgroundColor: "var(--color-surface-hover)" }
          }}
        >
          İptal
        </Button>
      }
    >
      {step === "search" && (
        <UserSearchStep
          onSelectUser={handleSelectUser}
          onCreateNew={handleCreateNew}
          isPending={isPending}
        />
      )}

      {step === "create" && (
        <CreateUserStep
          initialSearchQuery={searchQuery}
          onSubmit={handleCreateSubmit}
          onBack={handleBackToSearch}
          isPending={isPending}
        />
      )}
    </SsoModal>
  );
}

export default AddUserForm;
