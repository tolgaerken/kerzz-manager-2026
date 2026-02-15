import { User } from "lucide-react";
import { MyProfileCard } from "../features/employee-profile";

export function MyProfilePage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <User className="h-6 w-6 text-[var(--color-primary)]" />
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          Profilim
        </h1>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl">
        <MyProfileCard />
      </div>
    </div>
  );
}

export default MyProfilePage;
