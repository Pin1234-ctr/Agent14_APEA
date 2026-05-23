// src/pages/RCA/RCAPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rcaApi, exceptionApi } from "@/services/api/endpoints";
import { Brain, Zap } from "lucide-react";

export function RCAPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any | null>(null);
  const [devId, setDevId] = useState("");

  const { data: rcas, isLoading } = useQuery({
    queryKey: ["rca"],
    queryFn:  () => rcaApi.list(),
    refetchInterval: 30_000,
  });

  const genMut = useMutation({
    mutationFn: (id: number) => rcaApi.generate(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["rca"] }); setDevId(""); },
  });

  const rows: any[] = [...(rcas || [])].sort((a: any, b: any) => a.id - b.id);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold text-text flex items-center gap-2"><Brain className="w-5 h-5 text-amber-500" /> Root Cause Analysis</h1>
          <p className="text-sm text-subtext">LLM-generated root cause and solution for each exception</p>
        </div>
        {/* <div className="flex items-center gap-2">
          <input value={devId} onChange={e=>setDevId(e.target.value)} placeholder="Exception ID" className="w-32 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none" />
          <button onClick={()=>genMut.mutate(parseInt(devId))} disabled={genMut.isPending || !devId}
            className="flex items-center gap-1.5 rounded-lg bg-text text-bg px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50">
            <Zap className="w-3.5 h-3.5" /> {genMut.isPending ? "Generating…" : "Generate RCA"}
          </button>
        </div> */}
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-xs text-subtext text-center py-8">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <Brain className="w-8 h-8 text-subtext mx-auto mb-2" />
            <p className="text-sm text-subtext">No RCA records yet. They are generated automatically when tickets are raised.</p>
          </div>
        ) : rows.map((r: any) => (
          <div key={r.id} className="rounded-xl border border-border bg-surface p-5 cursor-pointer hover:border-primary/40 transition-colors" onClick={()=>setSelected(r)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-text">RCA #{r.id}</span>
                {r.deviation_id && <span className="text-xs text-subtext">· Exception #{r.deviation_id}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-subtext">{r.confidence ? `${Math.round(r.confidence * 100)}% confidence` : ""}</span>
                <span className="text-xs text-subtext">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
              </div>
            </div>
            {r.root_cause && (
              <div className="mb-2">
                <p className="text-xs font-medium text-subtext mb-1">Root Cause</p>
                <p className="text-sm text-text line-clamp-2">{r.root_cause}</p>
              </div>
            )}
            {r.solution && (
              <div>
                <p className="text-xs font-medium text-subtext mb-1">Solution</p>
                <p className="text-sm text-text line-clamp-2">{r.solution}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={()=>setSelected(null)}>
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-4 max-h-[80vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h2 className="text-sm font-semibold text-text flex items-center gap-2"><Brain className="w-4 h-4 text-amber-500" /> RCA #{selected.id}</h2>
            <div>
              <p className="text-xs font-medium text-subtext mb-2">Root Cause</p>
              <p className="text-sm text-text whitespace-pre-wrap">{selected.root_cause || "—"}</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-medium text-subtext mb-2">Solution / Recommendation</p>
              <p className="text-sm text-text whitespace-pre-wrap">{selected.solution || "—"}</p>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between text-xs text-subtext">
              <span>Confidence: {selected.confidence ? `${Math.round(selected.confidence*100)}%` : "—"}</span>
              <span>{selected.generated_by}</span>
            </div>
            <button onClick={()=>setSelected(null)} className="w-full rounded-lg border border-border py-2 text-xs hover:bg-muted">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
