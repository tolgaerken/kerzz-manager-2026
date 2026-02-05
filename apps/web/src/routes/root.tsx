import { Outlet } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-lg font-semibold">Kerzz Manager</h1>
      </header>
      <main className="px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
