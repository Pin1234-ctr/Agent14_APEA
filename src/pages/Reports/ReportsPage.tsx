// src/pages/Reports/ReportsPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/services/api/endpoints";
import { FileText, Download } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";

export function ReportsPage() {
  const [days, setDays]     = useState("7");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: list } = useQuery({ queryKey: ["reports"], queryFn: reportApi.list, refetchInterval: 60_000 });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const resp = await reportApi.generate(format, parseInt(days));
      const url  = URL.createObjectURL(resp.data);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `apea_report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  const rows: any[] = list || [];
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text flex items-center gap-2"><FileText className="w-5 h-5" /> Reports</h1>
        <p className="text-sm text-subtext">Generate and download exception reports</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium text-text mb-4">Generate Report</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-xs text-subtext block mb-1">Period</label>
            <select className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text" value={days} onChange={e=>setDays(e.target.value)}>
              {[["7","Last 7 days"],["14","Last 14 days"],["30","Last 30 days"],["90","Last 90 days"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-subtext block mb-1">Format</label>
            <select className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text" value={format} onChange={e=>setFormat(e.target.value)}>
              <option value="pdf">PDF</option>
              <option value="docx">Word (.docx)</option>
            </select>
          </div>
          <div className="pt-4">
            <button onClick={handleGenerate} disabled={loading} className="flex items-center gap-2 rounded-lg bg-text text-bg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
              <Download className="w-4 h-4" /> {loading ? "Generating…" : "Generate & Download"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-5 py-3 border-b border-border"><h2 className="text-sm font-medium text-text">Recent Reports</h2></div>
        {(!list || list.length === 0) ? (
          <p className="px-5 py-6 text-sm text-subtext">No reports generated yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  {["Filename","Size","Modified"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase">{h}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-border">
                  {paginatedRows.map((r: any) => (
                    <tr key={r.filename} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-text">{r.filename}</td>
                      <td className="px-4 py-3 text-subtext">{(r.size/1024).toFixed(1)} KB</td>
                      <td className="px-4 py-3 text-subtext">{new Date(r.modified * 1000).toLocaleString()}</td>
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
          </>
        )}
      </div>
    </div>
  );
}
