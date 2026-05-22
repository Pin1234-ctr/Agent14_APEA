import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/Reports/ReportsPage.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/services/api/endpoints";
import { FileText, Download } from "lucide-react";
import { Pagination } from "@/components/shared/Pagination";
export function ReportsPage() {
    const [days, setDays] = useState("7");
    const [format, setFormat] = useState("pdf");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const { data: list } = useQuery({ queryKey: ["reports"], queryFn: reportApi.list, refetchInterval: 60000 });
    const handleGenerate = async () => {
        setLoading(true);
        try {
            const resp = await reportApi.generate(format, parseInt(days));
            const url = URL.createObjectURL(resp.data);
            const a = document.createElement("a");
            a.href = url;
            a.download = `apea_report.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        }
        finally {
            setLoading(false);
        }
    };
    const rows = list || [];
    const totalPages = Math.ceil(rows.length / pageSize);
    const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-lg font-semibold text-text flex items-center gap-2", children: [_jsx(FileText, { className: "w-5 h-5" }), " Reports"] }), _jsx("p", { className: "text-sm text-subtext", children: "Generate and download exception reports" })] }), _jsxs("div", { className: "rounded-xl border border-border bg-surface p-5", children: [_jsx("h2", { className: "text-sm font-medium text-text mb-4", children: "Generate Report" }), _jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs text-subtext block mb-1", children: "Period" }), _jsx("select", { className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text", value: days, onChange: e => setDays(e.target.value), children: [["7", "Last 7 days"], ["14", "Last 14 days"], ["30", "Last 30 days"], ["90", "Last 90 days"]].map(([v, l]) => _jsx("option", { value: v, children: l }, v)) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs text-subtext block mb-1", children: "Format" }), _jsxs("select", { className: "rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text", value: format, onChange: e => setFormat(e.target.value), children: [_jsx("option", { value: "pdf", children: "PDF" }), _jsx("option", { value: "docx", children: "Word (.docx)" })] })] }), _jsx("div", { className: "pt-4", children: _jsxs("button", { onClick: handleGenerate, disabled: loading, className: "flex items-center gap-2 rounded-lg bg-text text-bg px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50", children: [_jsx(Download, { className: "w-4 h-4" }), " ", loading ? "Generating…" : "Generate & Download"] }) })] })] }), _jsxs("div", { className: "rounded-xl border border-border bg-surface overflow-hidden", children: [_jsx("div", { className: "px-5 py-3 border-b border-border", children: _jsx("h2", { className: "text-sm font-medium text-text", children: "Recent Reports" }) }), (!list || list.length === 0) ? (_jsx("p", { className: "px-5 py-6 text-sm text-subtext", children: "No reports generated yet." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-muted/50", children: _jsx("tr", { children: ["Filename", "Size", "Modified"].map(h => _jsx("th", { className: "px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase", children: h }, h)) }) }), _jsx("tbody", { className: "divide-y divide-border", children: paginatedRows.map((r) => (_jsxs("tr", { className: "hover:bg-muted/30 transition-colors", children: [_jsx("td", { className: "px-4 py-3 text-text", children: r.filename }), _jsxs("td", { className: "px-4 py-3 text-subtext", children: [(r.size / 1024).toFixed(1), " KB"] }), _jsx("td", { className: "px-4 py-3 text-subtext", children: new Date(r.modified * 1000).toLocaleString() })] }, r.filename))) })] }) }), _jsx(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: setCurrentPage })] }))] })] }));
}
