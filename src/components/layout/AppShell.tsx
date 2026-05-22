// src/components/layout/AppShell.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./Header/Header";
import { Sidebar } from "./Sidebar/Sidebar";

export function AppShell() {
  return (
    <div className="h-screen w-full flex flex-col bg-bg text-text overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
