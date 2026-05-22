// src/pages/Settings/SettingsPage.tsx
import { useAuth } from "@/context/AuthContext";
import { Settings, User, Shield } from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-text flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h1>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium text-text flex items-center gap-2"><User className="w-4 h-4" /> Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-subtext mb-1">Full name</p><p className="text-text font-medium">{user?.full_name}</p></div>
          <div><p className="text-xs text-subtext mb-1">Email</p><p className="text-text font-medium">{user?.email}</p></div>
          <div><p className="text-xs text-subtext mb-1">Role</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary px-2 py-0.5 text-xs font-medium capitalize"><Shield className="w-3 h-3" />{user?.role}</span>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-text mb-3">System Information</h2>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[["Version","APEA v2.0.0"],["LLM","Mistral Small"],["Connectors","CSV, FTP"],["Sync Interval","60 seconds"],["Trend Threshold","3 occurrences"]].map(([k,v])=>(
            <div key={k}><p className="text-subtext">{k}</p><p className="font-medium text-text">{v}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
