import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useCompanies, useUpdateCompany } from "../features/companies/hooks";
import { CompanyFormModal } from "../features/companies/components/CompanyFormModal";
import type { GroupCompany, UpdateGroupCompanyInput } from "../features/companies/types";

export function CompanyManagementPage() {
  const [selectedCompany, setSelectedCompany] = useState<GroupCompany | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryParams = useMemo(() => ({ includeInactive: true }), []);
  const { data: companies = [], isLoading, isFetching, refetch } = useCompanies(queryParams);
  const updateCompanyMutation = useUpdateCompany();

  const openEditModal = (company: GroupCompany) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const handleSubmit = async (id: string, data: UpdateGroupCompanyInput) => {
    await updateCompanyMutation.mutateAsync({ id, data });
    closeEditModal();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">Firma Yönetimi</h1>
          <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
            Toplam {companies.length} kayıt (aktif ve pasif dahil)
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isLoading || isFetching}
          className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-2 text-sm text-[var(--color-foreground)] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading || isFetching ? "animate-spin" : ""}`} />
          Yenile
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-elevated)] text-left text-[var(--color-foreground)]">
              <tr>
                <th className="px-4 py-3 font-medium">Kod</th>
                <th className="px-4 py-3 font-medium">IDC</th>
                <th className="px-4 py-3 font-medium">Firma</th>
                <th className="px-4 py-3 font-medium">Cloud DB</th>
                <th className="px-4 py-3 font-medium">Durum</th>
                <th className="px-4 py-3 font-medium text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr
                  key={company._id}
                  className="border-t border-[var(--color-border)] text-[var(--color-foreground)]"
                >
                  <td className="px-4 py-3">{company.id}</td>
                  <td className="px-4 py-3">{company.idc}</td>
                  <td className="px-4 py-3">{company.name}</td>
                  <td className="px-4 py-3">{company.cloudDb || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        company.isActive
                          ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                          : "bg-[var(--color-warning)]/15 text-[var(--color-warning)]"
                      }`}
                    >
                      {company.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditModal(company)}
                      className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)]"
                    >
                      Düzenle
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && companies.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
                  >
                    Firma kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CompanyFormModal
        isOpen={isModalOpen}
        company={selectedCompany}
        isLoading={updateCompanyMutation.isPending}
        onClose={closeEditModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
