import { Plus, Trash2, Star } from "lucide-react";
import type { ErpMappingInput } from "../../types";
import { useCompanies } from "../../../companies";

interface ErpMappingsEditorProps {
  mappings: ErpMappingInput[];
  legacyErpId?: string;
  onChange: (mappings: ErpMappingInput[]) => void;
}

const inputClasses =
  "w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm";

const labelClasses = "block text-sm font-medium text-[var(--color-foreground)] mb-1";

export function ErpMappingsEditor({
  mappings,
  legacyErpId,
  onChange,
}: ErpMappingsEditorProps) {
  const { data: companiesData } = useCompanies();

  const activeCompanies = (companiesData || [])
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.idc, name: c.name }));

  const handleAddMapping = () => {
    const usedCompanies = mappings.map((m) => m.companyId);
    const availableCompany = activeCompanies.find(
      (c) => !usedCompanies.includes(c.id)
    );

    if (!availableCompany) return;

    onChange([
      ...mappings,
      {
        companyId: availableCompany.id,
        erpId: "",
        isPrimary: mappings.length === 0,
      },
    ]);
  };

  const handleRemoveMapping = (index: number) => {
    const newMappings = mappings.filter((_, i) => i !== index);
    if (newMappings.length > 0 && !newMappings.some((m) => m.isPrimary)) {
      newMappings[0].isPrimary = true;
    }
    onChange(newMappings);
  };

  const handleMappingChange = (
    index: number,
    field: keyof ErpMappingInput,
    value: string | boolean
  ) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };

    if (field === "isPrimary" && value === true) {
      newMappings.forEach((m, i) => {
        if (i !== index) m.isPrimary = false;
      });
    }

    onChange(newMappings);
  };

  const usedCompanyIds = mappings.map((m) => m.companyId);
  const canAddMore = activeCompanies.some(
    (c) => !usedCompanyIds.includes(c.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={labelClasses}>ERP Kodları</label>
        {canAddMore && (
          <button
            type="button"
            onClick={handleAddMapping}
            className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Firma Ekle
          </button>
        )}
      </div>

      {legacyErpId && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
          <Star className="h-4 w-4 text-[var(--color-warning)] fill-current" />
          <span className="text-sm text-[var(--color-muted-foreground)]">
            Mevcut ERP Kodu (Legacy):
          </span>
          <code className="text-sm font-mono text-[var(--color-foreground)]">
            {legacyErpId}
          </code>
        </div>
      )}

      {mappings.length === 0 && !legacyErpId && (
        <p className="text-sm text-[var(--color-muted-foreground)] italic">
          Henüz ERP kodu tanımlanmamış
        </p>
      )}

      <div className="space-y-2">
        {mappings.map((mapping, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <select
              value={mapping.companyId}
              onChange={(e) =>
                handleMappingChange(index, "companyId", e.target.value)
              }
              className={`${inputClasses} w-32`}
            >
              {activeCompanies.map((company) => (
                <option
                  key={company.id}
                  value={company.id}
                  disabled={
                    usedCompanyIds.includes(company.id) &&
                    company.id !== mapping.companyId
                  }
                >
                  {company.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={mapping.erpId}
              onChange={(e) =>
                handleMappingChange(index, "erpId", e.target.value)
              }
              placeholder="ERP Kodu"
              className={`${inputClasses} flex-1`}
            />

            <button
              type="button"
              onClick={() =>
                handleMappingChange(index, "isPrimary", !mapping.isPrimary)
              }
              className={`p-2 rounded-md transition-colors ${
                mapping.isPrimary
                  ? "text-[var(--color-warning)] bg-[var(--color-warning)]/10"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10"
              }`}
              title={mapping.isPrimary ? "Birincil" : "Birincil yap"}
            >
              <Star
                className={`h-4 w-4 ${mapping.isPrimary ? "fill-current" : ""}`}
              />
            </button>

            <button
              type="button"
              onClick={() => handleRemoveMapping(index)}
              className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-md transition-colors"
              title="Kaldır"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
