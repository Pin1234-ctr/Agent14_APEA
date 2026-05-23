// src/pages/Dashboard/DashboardPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/services/api/endpoints";
import { AlertTriangle, Ticket, Activity, TrendingUp, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Pagination } from "@/components/shared/Pagination";

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#22c55e",
};

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 flex items-center gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-subtext">{label}</p>
        <p className="text-2xl font-semibold text-text">{value ?? "—"}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const stats    = useQuery({ queryKey: ["dashboard","stats"],    queryFn: dashboardApi.stats,    refetchInterval: 30_000 });
  const severity = useQuery({ queryKey: ["dashboard","severity"], queryFn: dashboardApi.severity, refetchInterval: 60_000 });
  const recent   = useQuery({ queryKey: ["dashboard","recent"],   queryFn: () => dashboardApi.recent(25), refetchInterval: 30_000 });
  const sla      = useQuery({ queryKey: ["dashboard","sla"],      queryFn: dashboardApi.sla, refetchInterval: 60_000 });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const s = stats.data;
  const sevData = (severity.data || []).map((r: any) => ({ name: r.severity, value: r.count }));

  const recentRows = recent.data || [];
  const totalPages = Math.ceil(recentRows.length / pageSize);
  const paginatedRecentRows = recentRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text">Dashboard</h1>
        <p className="text-sm text-subtext">Live production monitoring overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Open Exceptions"  value={s?.deviations_open}  icon={AlertTriangle} color="bg-danger/10 text-danger" />
        <StatCard label="Critical"         value={s?.critical_open}    icon={TrendingUp}    color="bg-orange-500/10 text-orange-500" />
        <StatCard label="Open Tickets"     value={s?.tickets_open}     icon={Ticket}        color="bg-primary/10 text-primary" />
      </div>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold text-text mb-6">Severity Breakdown </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Column 1: Pie Chart */}
          <div className="flex justify-center items-center">
            {sevData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie 
                    data={sevData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={90} 
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {sevData.map((e: any) => <Cell key={e.name} fill={SEV_COLORS[e.name] || "#888"} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: "var(--color-surface)", 
                      border: "1px solid var(--color-border)", 
                      borderRadius: 8, 
                      fontSize: 12 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-subtext py-10">No severity data available</p>
            )}
          </div>

          {/* Column 2: Severity stats & SLA details */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {sevData.map((e: any) => {
                const total = sevData.reduce((acc: number, curr: any) => acc + curr.value, 0);
                const pct = total > 0 ? Math.round((e.value / total) * 100) : 0;
                return (
                  <div key={e.name} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: SEV_COLORS[e.name] }} />
                    <div>
                      <p className="text-xs font-medium text-text capitalize">{e.name}</p>
                      <p className="text-sm font-semibold text-subtext">{e.value} <span className="text-[10px] text-subtext/70">({pct}%)</span></p>
                    </div>
                  </div>
                );
              })}
            </div>


          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium text-text">Recent Exceptions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Plant","Department","Machine","Metric","Actual","Expected","Severity","Status","Time"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.isLoading ? (
                <tr><td colSpan={9} className="px-4 py-6 text-center text-subtext text-xs">Loading…</td></tr>
              ) : paginatedRecentRows.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 text-text">{r.plant}</td>
                  <td className="px-4 py-2.5 text-subtext">{r.line || "—"}</td>
                  <td className="px-4 py-2.5 text-subtext">{r.machine || "—"}</td>
                  <td className="px-4 py-2.5 text-text font-medium">{r.metric}</td>
                  <td className="px-4 py-2.5 text-text">{r.actual_value ?? "—"}</td>
                  <td className="px-4 py-2.5 text-subtext">{r.expected_value ?? "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium
                      ${r.severity === "critical" ? "bg-danger/15 text-danger" :
                        r.severity === "high"     ? "bg-orange-500/15 text-orange-600" :
                        r.severity === "medium"   ? "bg-yellow-500/15 text-yellow-600" :
                                                    "bg-success/15 text-success"}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-subtext text-xs">{r.status}</td>
                  <td className="px-4 py-2.5 text-subtext text-xs">{r.event_time ? new Date(r.event_time).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
