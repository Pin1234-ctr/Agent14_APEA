// src/pages/Exceptions/ExceptionsPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exceptionApi } from "@/services/api/endpoints";
import { AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "@/components/shared/Pagination";

const SEV_CLASSES: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  high:     "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  medium:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  low:      "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};
const STA_CLASSES: Record<string, string> = {
  open:         "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  acknowledged: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  suppressed:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function ExceptionsPage() {
  const qc = useQueryClient();
  const [severity, setSeverity] = useState(""); const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["exceptions", severity, status],
    queryFn:  () => exceptionApi.list({ severity: severity||undefined, status: status||undefined, limit: 100 }),
    refetchInterval: 30_000,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, st }: any) => exceptionApi.updateStatus(id, st),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["exceptions"] }); setSelected(null); },
  });

  const rows: any[] = data || [];
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSeverityChange = (val: string) => {
    setSeverity(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-danger" /> Exceptions</h1>
          <p className="text-sm text-subtext">LLM-detected anomalies from synced data</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-subtext" />
          <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none" value={severity} onChange={e=>handleSeverityChange(e.target.value)}>
            <option value="">All severities</option>
            {["critical","high","medium","low"].map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none" value={status} onChange={e=>handleStatusChange(e.target.value)}>
            <option value="">All statuses</option>
            {["open","acknowledged","resolved","suppressed"].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{["Plant","Department","Machine","Metric","Expected","Actual","Dev%","Severity","Status","Source","Detected"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-subtext text-xs">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-subtext text-xs">No exceptions found</td></tr>
              ) : paginatedRows.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={()=>setSelected(r)}>
                  <td className="px-4 py-3 font-medium text-text whitespace-nowrap">{r.plant}</td>
                  <td className="px-4 py-3 text-subtext">{r.department||"—"}</td>
                  <td className="px-4 py-3 text-subtext">{r.machine||"—"}</td>
                  <td className="px-4 py-3 text-text font-medium">{r.metric}</td>
                  <td className="px-4 py-3 text-subtext">{r.expected_value ?? "—"}</td>
                  <td className="px-4 py-3 text-text">{r.actual_value ?? "—"}</td>
                  <td className="px-4 py-3 text-subtext">{r.deviation_pct != null ? `${r.deviation_pct}%` : "—"}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", SEV_CLASSES[r.severity]||"")}>{r.severity}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STA_CLASSES[r.status]||"")}>{r.status}</span></td>
                  <td className="px-4 py-3 text-subtext text-xs">{r.source}</td>
                  <td className="px-4 py-3 text-subtext text-xs whitespace-nowrap">{r.event_time ? new Date(r.event_time).toLocaleString() : "—"}</td>
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

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-4" onClick={e=>e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-text">Exception #{selected.id} — {selected.metric}</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[["Plant",selected.plant],["Department",selected.department||"—"],["Machine",selected.machine||"—"],["Severity",selected.severity],["Expected",selected.expected_value],["Actual",selected.actual_value],["Deviation",selected.deviation_pct!=null?`${selected.deviation_pct}%`:"—"],["Status",selected.status]].map(([k,v])=>(
                <div key={k}><p className="text-subtext">{k}</p><p className="font-medium text-text">{v}</p></div>
              ))}
            </div>
            {selected.description && <p className="text-xs text-subtext border-t border-border pt-3">{selected.description}</p>}
            <div className="flex gap-2 pt-2 border-t border-border flex-wrap">
              {["acknowledged","resolved","suppressed"].map(s=>(
                <button key={s} onClick={()=>updateMut.mutate({id:selected.id,st:s})} disabled={updateMut.isPending}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors capitalize disabled:opacity-50">
                  Mark {s}
                </button>
              ))}
              <button onClick={()=>setSelected(null)} className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
