import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Exceptions/ExceptionsPage.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { exceptionApi } from "@/services/api/endpoints";
import { AlertTriangle, Filter } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "@/components/shared/Pagination";
const SEV_CLASSES = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
};
const STA_CLASSES = {
    open: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    acknowledged: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    suppressed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};
export function ExceptionsPage() {
    const qc = useQueryClient();
    const [severity, setSeverity] = useState("");
    const [status, setStatus] = useState("");
    const [selected, setSelected] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const { data, isLoading } = useQuery({
        queryKey: ["exceptions", severity, status],
        queryFn: () => exceptionApi.list({ severity: severity || undefined, status: status || undefined, limit: 100 }),
        refetchInterval: 30000,
    });
    const updateMut = useMutation({
        mutationFn: ({ id, st }) => exceptionApi.updateStatus(id, st),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ["exceptions"] }); setSelected(null); },
    });
    const rows = data || [];
    const totalPages = Math.ceil(rows.length / pageSize);
    const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const handleSeverityChange = (val) => {
        setSeverity(val);
        setCurrentPage(1);
    };
    const handleStatusChange = (val) => {
        setStatus(val);
        setCurrentPage(1);
    };
    return (_jsxs("div", { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-lg font-semibold text-text flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-danger" }), " Exceptions"] }), _jsx("p", { className: "text-sm text-subtext", children: "LLM-detected anomalies from synced data" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-subtext" }), _jsxs("select", { className: "rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none", value: severity, onChange: e => handleSeverityChange(e.target.value), children: [_jsx("option", { value: "", children: "All severities" }), ["critical", "high", "medium", "low"].map(s => _jsx("option", { children: s }, s))] }), _jsxs("select", { className: "rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-text focus:outline-none", value: status, onChange: e => handleStatusChange(e.target.value), children: [_jsx("option", { value: "", children: "All statuses" }), ["open", "acknowledged", "resolved", "suppressed"].map(s => _jsx("option", { children: s }, s))] })] })] }), _jsxs("div", { className: "rounded-xl border border-border bg-surface overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-muted/50", children: _jsx("tr", { children: ["Plant", "Department", "Machine", "Metric", "Expected", "Actual", "Dev%", "Severity", "Status", "Source", "Detected"].map(h => (_jsx("th", { className: "px-4 py-2.5 text-left text-xs font-semibold text-subtext uppercase whitespace-nowrap", children: h }, h))) }) }), _jsx("tbody", { className: "divide-y divide-border", children: isLoading ? (_jsx("tr", { children: _jsx("td", { colSpan: 11, className: "px-4 py-8 text-center text-subtext text-xs", children: "Loading\u2026" }) })) : rows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 11, className: "px-4 py-8 text-center text-subtext text-xs", children: "No exceptions found" }) })) : paginatedRows.map((r) => (_jsxs("tr", { className: "hover:bg-muted/30 cursor-pointer transition-colors", onClick: () => setSelected(r), children: [_jsx("td", { className: "px-4 py-3 font-medium text-text whitespace-nowrap", children: r.plant }), _jsx("td", { className: "px-4 py-3 text-subtext", children: r.department || "—" }), _jsx("td", { className: "px-4 py-3 text-subtext", children: r.machine || "—" }), _jsx("td", { className: "px-4 py-3 text-text font-medium", children: r.metric }), _jsx("td", { className: "px-4 py-3 text-subtext", children: r.expected_value ?? "—" }), _jsx("td", { className: "px-4 py-3 text-text", children: r.actual_value ?? "—" }), _jsx("td", { className: "px-4 py-3 text-subtext", children: r.deviation_pct != null ? `${r.deviation_pct}%` : "—" }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: cn("rounded-full px-2 py-0.5 text-[10px] font-medium", SEV_CLASSES[r.severity] || ""), children: r.severity }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STA_CLASSES[r.status] || ""), children: r.status }) }), _jsx("td", { className: "px-4 py-3 text-subtext text-xs", children: r.source }), _jsx("td", { className: "px-4 py-3 text-subtext text-xs whitespace-nowrap", children: r.event_time ? new Date(r.event_time).toLocaleString() : "—" })] }, r.id))) })] }) }), _jsx(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: setCurrentPage })] }), selected && (_jsx("div", { className: "fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4", onClick: () => setSelected(null), children: _jsxs("div", { className: "bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-4", onClick: e => e.stopPropagation(), children: [_jsxs("h2", { className: "text-sm font-semibold text-text", children: ["Exception #", selected.id, " \u2014 ", selected.metric] }), _jsx("div", { className: "grid grid-cols-2 gap-3 text-xs", children: [["Plant", selected.plant], ["Department", selected.department || "—"], ["Machine", selected.machine || "—"], ["Severity", selected.severity], ["Expected", selected.expected_value], ["Actual", selected.actual_value], ["Deviation", selected.deviation_pct != null ? `${selected.deviation_pct}%` : "—"], ["Status", selected.status]].map(([k, v]) => (_jsxs("div", { children: [_jsx("p", { className: "text-subtext", children: k }), _jsx("p", { className: "font-medium text-text", children: v })] }, k))) }), selected.description && _jsx("p", { className: "text-xs text-subtext border-t border-border pt-3", children: selected.description }), _jsxs("div", { className: "flex gap-2 pt-2 border-t border-border flex-wrap", children: [["acknowledged", "resolved", "suppressed"].map(s => (_jsxs("button", { onClick: () => updateMut.mutate({ id: selected.id, st: s }), disabled: updateMut.isPending, className: "rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors capitalize disabled:opacity-50", children: ["Mark ", s] }, s))), _jsx("button", { onClick: () => setSelected(null), className: "ml-auto rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors", children: "Close" })] })] }) }))] }));
}
