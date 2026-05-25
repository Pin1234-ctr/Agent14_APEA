import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketApi } from "@/services/api/endpoints";
import { Ticket, TrendingUp, Filter, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "@/components/shared/Pagination";

const PRI: Record<string, string> = {
  P1: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  P2: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  P3: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  P4: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};
const STA: Record<string, string> = {
  open:        "bg-red-100 text-red-600",
  in_progress: "bg-blue-100 text-blue-700",
  resolved:    "bg-green-100 text-green-700",
  closed:      "bg-gray-100 text-gray-600",
};

export function TicketsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState(""); const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ plant:"", department:"", machine:"", issue:"", assigned_to:"", severity:"medium" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [countdown, setCountdown] = useState(30);

  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["tickets", status, priority],
    queryFn:  () => ticketApi.list({ status:status||undefined, priority:priority||undefined }),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [dataUpdatedAt]);

  const updateMut = useMutation({
    mutationFn: ({ id, s }: any) => ticketApi.updateStatus(id, s),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["tickets"] }); setSelected(null); },
  });

  const createMut = useMutation({
    mutationFn: (p: any) => ticketApi.create(p),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["tickets"] }); setShowCreate(false); setForm({plant:"",department:"",machine:"",issue:"",assigned_to:"",severity:"medium"}); setCurrentPage(1); },
  });

  const rows: any[] = data || [];
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handlePriorityChange = (val: string) => {
    setPriority(val);
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text flex items-center gap-2"><Ticket className="w-5 h-5" /> Tickets</h1>
          <p className="text-sm text-subtext">Auto-raised from exception detection </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-subtext" />
          <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none" value={status} onChange={e=>handleStatusChange(e.target.value)}>
            <option value="">All statuses</option>
            {["open","in_progress","resolved","closed"].map(s=><option key={s}>{s}</option>)}
          </select>
          <select className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none" value={priority} onChange={e=>handlePriorityChange(e.target.value)}>
            <option value="">All priorities</option>
            {["P1","P2","P3","P4"].map(p=><option key={p}>{p}</option>)}
          </select>
          
          <div className="h-4 w-px bg-border mx-1" />
          
          <span className="text-xs text-subtext font-mono whitespace-nowrap bg-muted px-2.5 py-1.5 rounded-lg border border-border">
            Refresh in {countdown}s
          </span>
          
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center justify-center rounded-lg border border-border bg-surface p-1.5 text-xs text-text hover:bg-muted transition-colors disabled:opacity-50"
            title="Refresh Now"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-subtext", isFetching && "animate-spin text-primary")} />
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{["Ref","Plant","Dept","Machine","Issue","Assigned To","Priority","Status","Raised"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-subtext text-xs">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-subtext text-xs">No tickets yet. They appear automatically when exceptions are detected.</td></tr>
              ) : paginatedRows.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={()=>setSelected(r)}>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{r.ticket_ref}</td>
                  <td className="px-4 py-3 font-medium text-text">{r.plant}</td>
                  <td className="px-4 py-3 text-subtext">{r.department||"—"}</td>
                  <td className="px-4 py-3 text-subtext">{r.machine||"—"}</td>
                  <td className="px-4 py-3 text-text max-w-xs truncate">{r.issue}</td>
                  <td className="px-4 py-3 text-subtext">{r.assigned_to||"—"}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", PRI[r.priority]||"")}>{r.priority}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STA[r.status]||"")}>{r.status}</span></td>
                  {/* <td className="px-4 py-3">{r.is_trend ? <span className="flex items-center gap-1 text-orange-600 text-xs"><TrendingUp className="w-3 h-3"/>Trend</span> : <span className="text-subtext text-xs">—</span>}</td> */}
                  <td className="px-4 py-3 text-subtext text-xs whitespace-nowrap">{r.raising_time ? new Date(r.raising_time).toLocaleString() : "—"}</td>
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-4" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary">{selected.ticket_ref}</span>
              {selected.is_trend && <span className="flex items-center gap-1 text-orange-600 text-xs bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-full"><TrendingUp className="w-3 h-3"/>Trend Alert</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[["Plant",selected.plant],["Department",selected.department||"—"],["Machine",selected.machine||"—"],["Priority",selected.priority],["Status",selected.status],["Assigned To",selected.assigned_to||"—"],["Detect Time",selected.detect_time?new Date(selected.detect_time).toLocaleString():"—"],["Raised",selected.raising_time?new Date(selected.raising_time).toLocaleString():"—"]].map(([k,v])=>(
                <div key={k}><p className="text-subtext">{k}</p><p className="font-medium text-text">{v}</p></div>
              ))}
            </div>
            {selected.issue && <div className="border-t border-border pt-3"><p className="text-xs text-subtext mb-1">Issue</p><p className="text-sm text-text">{selected.issue}</p></div>}
            {selected.root_cause && <div className="border-t border-border pt-3"><p className="text-xs text-subtext mb-1">Root Cause</p><p className="text-sm text-text">{selected.root_cause}</p></div>}
            {selected.solution && <div className="border-t border-border pt-3"><p className="text-xs text-subtext mb-1">Solution</p><p className="text-sm text-text">{selected.solution}</p></div>}
            <div className="flex gap-2 pt-2 border-t border-border flex-wrap">
              {["in_progress","resolved","closed"].map(s=>(
                <button key={s} onClick={()=>updateMut.mutate({id:selected.id,s})} disabled={updateMut.isPending}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted capitalize disabled:opacity-50">
                  {s.replace("_"," ")}
                </button>
              ))}
              <button onClick={()=>setSelected(null)} className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setShowCreate(false)}>
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-4" onClick={e=>e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-text">Create Ticket</h2>
            <div className="grid grid-cols-2 gap-3">
              {[["Plant","plant","Plant A"],["Department","department","Assembly"],["Machine","machine","CNC-01"],["Assigned To","assigned_to","John Doe"]].map(([l,k,p])=>(
                <div key={k}>
                  <label className="text-xs text-subtext block mb-1">{l}</label>
                  <input className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none" value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={p} />
                </div>
              ))}
              <div>
                <label className="text-xs text-subtext block mb-1">Severity</label>
                <select className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none" value={form.severity} onChange={e=>setForm(f=>({...f,severity:e.target.value}))}>
                  {["low","medium","high","critical"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-subtext block mb-1">Issue description</label>
              <textarea className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none h-20 resize-none" value={form.issue} onChange={e=>setForm(f=>({...f,issue:e.target.value}))} placeholder="Describe the issue…" />
            </div>
            <div className="flex gap-2">
              <button onClick={()=>createMut.mutate(form)} disabled={createMut.isPending||!form.plant||!form.issue}
                className="flex-1 rounded-lg bg-text text-bg py-2 text-xs font-medium hover:opacity-90 disabled:opacity-50">
                {createMut.isPending ? "Creating…" : "Create Ticket"}
              </button>
              <button onClick={()=>setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-xs hover:bg-muted">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
