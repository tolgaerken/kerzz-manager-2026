import { Outlet } from "@tanstack/react-router";
import { Sidebar } from "../Sidebar";
import { Header } from "../Header";
import { LogPanel, PipelineLogPanel, EntityLogPanel } from "../../../features/manager-log";

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
      
      {/* Pipeline Log Panel (Lead/Offer/Sale zinciri) */}
      <PipelineLogPanel />

      {/* Entity Log Panel (Kontrat/Lisans/Fatura/Ödeme Planı tab'lı) */}
      <EntityLogPanel />
    </div>
  );
}
