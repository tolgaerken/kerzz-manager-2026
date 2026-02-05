import { SidebarMenuItem } from "./SidebarMenuItem";
import { sidebarMenuItems } from "./sidebarConfig";

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col bg-surface border-r border-border">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-border px-6">
        <h1 className="text-xl font-bold text-foreground">Kerzz Manager</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {sidebarMenuItems.map((item) => (
            <li key={item.label}>
              <SidebarMenuItem {...item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <p className="text-xs text-subtle text-center">
          © 2026 Kerzz Manager
        </p>
      </div>
    </aside>
  );
}
