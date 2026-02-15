import { Users } from "lucide-react";
import { EmployeeProfileGrid } from "../features/employee-profile";

export function EmployeeProfilesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-[var(--color-primary)]" />
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Çalışan Profilleri
        </h1>
      </div>

      {/* Grid */}
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <EmployeeProfileGrid />
      </div>
    </div>
  );
}

export default EmployeeProfilesPage;
