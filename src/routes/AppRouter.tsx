// src/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage }       from "@/pages/Auth/LoginPage";
import { LandingPage }     from "@/pages/LandingPage";
import { DashboardPage }   from "@/pages/Dashboard/DashboardPage";
import { ConnectorsPage }  from "@/pages/Connectors/ConnectorsPage";
import { ExceptionsPage }  from "@/pages/Exceptions/ExceptionsPage";
import { TicketsPage }     from "@/pages/Tickets/TicketsPage";
import { RCAPage }         from "@/pages/RCA/RCAPage";
import { ChatbotPage }     from "@/pages/Chatbot/ChatbotPage";
import { ReportsPage }     from "@/pages/Reports/ReportsPage";
import { SettingsPage }    from "@/pages/Settings/SettingsPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-subtext text-sm">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protected><AppShell /></Protected>}>
        <Route path="/dashboard"  element={<DashboardPage />} />
        <Route path="/connectors" element={<ConnectorsPage />} />
        <Route path="/exceptions" element={<ExceptionsPage />} />
        <Route path="/tickets"    element={<TicketsPage />} />
        <Route path="/rca"        element={<RCAPage />} />
        <Route path="/chatbot"    element={<ChatbotPage />} />
        <Route path="/reports"    element={<ReportsPage />} />
        <Route path="/settings"   element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
