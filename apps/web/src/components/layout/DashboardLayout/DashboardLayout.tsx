import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import { LogPanel } from "../../../features/logs";

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        <main className="flex min-h-0 flex-1 flex-col p-6">
          <Outlet />
        </main>
      </div>

      {/* Global Log Panel */}
      <LogPanel />
    </div>
  );
}
