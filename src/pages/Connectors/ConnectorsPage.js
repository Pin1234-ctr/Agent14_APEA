import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
// src/pages/Connectors/ConnectorsPage.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectorApi } from "@/services/api/endpoints";
import { FileText, Server, RefreshCw, Wifi, ChevronDown, ChevronUp, CheckCircle, XCircle, PlugZap, Search, Plus, Edit3, UploadCloud, Play, Power, Check, X, Settings2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { Pagination } from "@/components/shared/Pagination";
// ── Sync countdown ────────────────────────────────────────────────────────────
function SyncBar({ enabled, onSync, lastSync, rows }) {
    const [cd, setCd] = useState(60);
    const ref = useRef();
    useEffect(() => {
        if (!enabled) {
            clearInterval(ref.current);
            setCd(60);
            return;
        }
        setCd(60);
        ref.current = setInterval(() => {
            setCd(c => { if (c <= 1) {
                onSync();
                return 60;
            } return c - 1; });
        }, 1000);
        return () => clearInterval(ref.current);
    }, [enabled]);
    if (!enabled)
        return null;
    return (_jsxs("div", { className: "rounded-lg bg-muted px-3 py-2 mt-2", children: [_jsxs("div", { className: "flex items-center justify-between text-xs text-subtext mb-1", children: [_jsxs("span", { children: ["Next sync in ", _jsxs("strong", { className: "text-text", children: [cd, "s"] }), lastSync && _jsxs(_Fragment, { children: [" \u00B7 Last: ", _jsx("strong", { className: "text-text", children: lastSync })] }), rows > 0 && _jsxs(_Fragment, { children: [" \u00B7 Rows: ", _jsx("strong", { className: "text-text", children: rows.toLocaleString() })] })] }), _jsxs("button", { onClick: onSync, className: "flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[10px] hover:bg-muted transition-colors text-text", children: [_jsx(RefreshCw, { className: "w-2.5 h-2.5 animate-spin-slow" }), " Sync now"] })] }), _jsx("div", { className: "h-1 rounded-full bg-border overflow-hidden", children: _jsx("div", { className: "h-full bg-success rounded-full transition-all duration-1000", style: { width: `${Math.round(((60 - cd) / 60) * 100)}%` } }) })] }));
}
// ── Log drawer ────────────────────────────────────────────────────────────────
function LogDrawer({ name }) {
    const [open, setOpen] = useState(true); // Default open in expanded row
    const { data } = useQuery({
        queryKey: ["connector-logs", name],
        queryFn: () => connectorApi.logs(name),
        enabled: open,
    });
    const logs = data || [];
    return (_jsxs("div", { className: "border border-border rounded-xl bg-bg/50 overflow-hidden", children: [_jsxs("button", { onClick: () => setOpen(o => !o), className: "w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-text bg-muted/40 hover:bg-muted/60 transition-colors", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5 text-primary" }), " Sync History (", logs.length, ")"] }), open ? _jsx(ChevronUp, { className: "w-3.5 h-3.5 text-subtext" }) : _jsx(ChevronDown, { className: "w-3.5 h-3.5 text-subtext" })] }), open && (_jsxs("div", { className: "px-4 py-2 max-h-[180px] overflow-y-auto divide-y divide-border", children: [logs.length === 0 && _jsx("p", { className: "text-xs text-subtext py-3 text-center", children: "No history recorded yet." }), logs.map((l, i) => (_jsxs("div", { className: "flex items-center gap-2 py-2 text-xs", children: [_jsx("span", { className: "font-mono text-subtext w-[70px] shrink-0", children: l.started_at ? new Date(l.started_at).toTimeString().slice(0, 8) : "—" }), l.status === "success" ? _jsx(CheckCircle, { className: "w-3.5 h-3.5 text-success shrink-0" }) : _jsx(XCircle, { className: "w-3.5 h-3.5 text-danger shrink-0" }), _jsx("span", { className: "text-text truncate max-w-[150px] md:max-w-[250px]", children: l.error || "Sync completed successfully" }), _jsxs("span", { className: "ml-auto font-mono text-success font-medium shrink-0", children: ["+", l.upserted || 0, " rows"] })] }, i)))] }))] }));
}
// ── Badge status helper ───────────────────────────────────────────────────────
function Badge({ status }) {
    const cls = {
        connected: "bg-success/15 text-success border-success/30",
        disconnected: "bg-muted text-subtext border-border",
        syncing: "bg-primary/15 text-primary border-primary/30"
    };
    return (_jsxs("span", { className: cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all", cls[status]), children: [_jsx("span", { className: cn("h-1.5 w-1.5 rounded-full", {
                    "bg-success": status === "connected",
                    "bg-subtext": status === "disconnected",
                    "bg-primary animate-pulse": status === "syncing"
                }) }), status === "connected" ? "Connected" : status === "syncing" ? "Syncing…" : "Not Configured"] }));
}
// ── Page ──────────────────────────────────────────────────────────────────────
export function ConnectorsPage() {
    const qc = useQueryClient();
    const fileInputRef = useRef(null);
    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const [toast, setToast] = useState("");
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const notify = (m) => {
        setToast(m);
        setTimeout(() => setToast(""), 3000);
    };
    // Queries
    const { data: csvCfg } = useQuery({ queryKey: ["connector", "csv"], queryFn: () => connectorApi.get("csv") });
    const { data: ftpCfg } = useQuery({ queryKey: ["connector", "ftp"], queryFn: () => connectorApi.get("ftp") });
    // Mutations
    const saveCsvMut = useMutation({ mutationFn: (p) => connectorApi.save("csv", p), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector", "csv"] }) });
    const saveFtpMut = useMutation({ mutationFn: (p) => connectorApi.save("ftp", p), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector", "ftp"] }) });
    const testCsvMut = useMutation({ mutationFn: () => connectorApi.test("csv") });
    const testFtpMut = useMutation({ mutationFn: () => connectorApi.test("ftp") });
    const syncCsvMut = useMutation({ mutationFn: () => connectorApi.sync("csv"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector-logs", "csv"] }) });
    const syncFtpMut = useMutation({ mutationFn: () => connectorApi.sync("ftp"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector-logs", "ftp"] }) });
    const togCsvMut = useMutation({ mutationFn: () => connectorApi.toggle("csv"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector", "csv"] }) });
    const togFtpMut = useMutation({ mutationFn: () => connectorApi.toggle("ftp"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector", "ftp"] }) });
    // Local rows count
    const [csvRows, setCsvRows] = useState(0);
    const [ftpRows, setFtpRows] = useState(0);
    // Modal form states
    const [isOpen, setIsOpen] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [connectorName, setConnectorName] = useState("");
    const [activeType, setActiveType] = useState("csv");
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    // CSV form inputs
    const [csvFile, setCsvFile] = useState(null);
    const [csvFileName, setCsvFileName] = useState("");
    const [csvFileSize, setCsvFileSize] = useState(null);
    const [csvFilePath, setCsvFilePath] = useState("");
    const [delimiter, setDelimiter] = useState(",");
    const [encoding, setEncoding] = useState("UTF-8");
    const [plantCol, setPlantCol] = useState("plant");
    const [machineCol, setMachineCol] = useState("machine");
    const [skipRows, setSkipRows] = useState("0");
    const [isDragging, setIsDragging] = useState(false);
    // FTP form inputs
    const [host, setHost] = useState("");
    const [port, setPort] = useState("21");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remoteDir, setRemoteDir] = useState("/");
    const [filePattern, setFilePattern] = useState("*.csv");
    const [protocol, setProtocol] = useState("FTP");
    // Load configuration into modal on edit
    const handleEdit = (type) => {
        setModalMode("edit");
        setActiveType(type);
        setConnectorName(type === "csv" ? "CSV Connector" : "FTP Connector");
        if (type === "csv") {
            if (csvCfg?.file_path) {
                setCsvFileName(csvCfg.file_path.split("/").pop() || "data.csv");
                setCsvFilePath(csvCfg.file_path);
                setDelimiter(csvCfg.delimiter || ",");
                setEncoding(csvCfg.encoding || "UTF-8");
                setPlantCol(csvCfg.plant_col || "plant");
                setMachineCol(csvCfg.machine_col || "machine");
                setSkipRows(String(csvCfg.skip_rows || 0));
            }
            else {
                // Reset defaults
                setCsvFileName("");
                setCsvFilePath("");
                setDelimiter(",");
                setEncoding("UTF-8");
                setPlantCol("plant");
                setMachineCol("machine");
                setSkipRows("0");
            }
        }
        else {
            if (ftpCfg?.host) {
                setHost(ftpCfg.host);
                setPort(String(ftpCfg.port || 21));
                setUsername(ftpCfg.username || "");
                setPassword("");
                setRemoteDir(ftpCfg.remote_dir || "/");
                setFilePattern(ftpCfg.file_pattern || "*.csv");
                setProtocol((ftpCfg.protocol || "ftp").toUpperCase());
            }
            else {
                // Reset defaults
                setHost("");
                setPort("21");
                setUsername("");
                setPassword("");
                setRemoteDir("/");
                setFilePattern("*.csv");
                setProtocol("FTP");
            }
        }
        setIsOpen(true);
    };
    const handleOpenAdd = () => {
        setModalMode("add");
        setConnectorName("");
        setActiveType("csv"); // default
        // Reset inputs
        setCsvFile(null);
        setCsvFileName("");
        setCsvFileSize(null);
        setCsvFilePath("");
        setDelimiter(",");
        setEncoding("UTF-8");
        setPlantCol("plant");
        setMachineCol("machine");
        setSkipRows("0");
        setHost("");
        setPort("21");
        setUsername("");
        setPassword("");
        setRemoteDir("/");
        setFilePattern("*.csv");
        setProtocol("FTP");
        setIsOpen(true);
    };
    // Drag & drop file select handlers
    const handleFileSelect = (file) => {
        if (!file)
            return;
        setCsvFile(file);
        setCsvFileName(file.name);
        setCsvFileSize(file.size);
        setCsvFilePath(`/uploads/${file.name}`);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith(".csv")) {
            handleFileSelect(file);
        }
        else {
            notify("⚠ Only CSV files are supported");
        }
    };
    // Save handling
    const handleSave = async () => {
        if (!connectorName) {
            notify("⚠ Connector name is required");
            return;
        }
        if (activeType === "csv") {
            if (!csvFilePath) {
                notify("⚠ CSV file upload or file path is required");
                return;
            }
            try {
                await saveCsvMut.mutateAsync({
                    file_path: csvFilePath,
                    delimiter,
                    encoding,
                    plant_col: plantCol,
                    machine_col: machineCol,
                    skip_rows: parseInt(skipRows) || 0,
                    sync_interval: 60
                });
                notify("✓ CSV Connector saved successfully");
                setIsOpen(false);
            }
            catch (err) {
                notify(`✗ Save failed: ${err.message || err}`);
            }
        }
        else {
            if (!host || !username) {
                notify("⚠ Host and username are required");
                return;
            }
            try {
                await saveFtpMut.mutateAsync({
                    host,
                    port: parseInt(port) || 21,
                    username,
                    password: password || undefined,
                    remote_dir: remoteDir,
                    file_pattern: filePattern,
                    protocol: protocol.toLowerCase(),
                    sync_interval: 60
                });
                notify("✓ FTP Connector saved successfully");
                setIsOpen(false);
            }
            catch (err) {
                notify(`✗ Save failed: ${err.message || err}`);
            }
        }
    };
    // Test handling
    const handleTest = async () => {
        if (activeType === "csv") {
            if (!csvFilePath) {
                notify("⚠ CSV file path required to test");
                return;
            }
            try {
                const r = await testCsvMut.mutateAsync();
                notify(r.ok ? `✓ ${r.message}` : `✗ ${r.message}`);
            }
            catch (e) {
                notify("✗ Connection test failed");
            }
        }
        else {
            if (!host || !username) {
                notify("⚠ Host and username required to test");
                return;
            }
            try {
                const r = await testFtpMut.mutateAsync();
                notify(r.ok ? `✓ ${r.message}` : `✗ ${r.message}`);
            }
            catch (e) {
                notify("✗ Connection test failed");
            }
        }
    };
    // Sync now trigger
    const handleSyncRow = async (type) => {
        if (type === "csv") {
            try {
                const r = await syncCsvMut.mutateAsync();
                setCsvRows(x => x + (r?.upserted || 0));
                notify(`↻ Synced CSV — ${r?.upserted || 0} rows`);
            }
            catch (e) {
                notify("✗ CSV Sync failed");
            }
        }
        else {
            try {
                const r = await syncFtpMut.mutateAsync();
                setFtpRows(x => x + (r?.upserted || 0));
                notify(`↻ Synced FTP — ${r?.upserted || 0} rows`);
            }
            catch (e) {
                notify("✗ FTP Sync failed");
            }
        }
    };
    // Connector rows mapping
    const connectorRows = [
        {
            id: "csv",
            name: "CSV Connector",
            type: "CSV",
            details: csvCfg?.file_path || "Not configured",
            configured: Boolean(csvCfg?.configured),
            enabled: Boolean(csvCfg?.enabled),
        },
        {
            id: "ftp",
            name: "FTP Connector",
            type: "FTP",
            details: ftpCfg?.host ? `${ftpCfg.protocol?.toUpperCase() || "FTP"}://${ftpCfg.host}:${ftpCfg.port}` : "Not configured",
            configured: Boolean(ftpCfg?.configured),
            enabled: Boolean(ftpCfg?.enabled),
        }
    ];
    // Filter based on search query
    const filteredRows = connectorRows.filter(row => row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalPages = Math.ceil(filteredRows.length / pageSize);
    const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return (_jsxs("div", { className: "p-6 max-w-5xl mx-auto", children: [toast && (_jsx("div", { className: "fixed bottom-5 right-5 z-[100] bg-text text-bg text-xs px-4 py-2.5 rounded-lg shadow-lg font-medium animate-fadeIn", children: toast })), _jsxs("div", { className: "mb-6", children: [_jsxs("h1", { className: "text-xl font-bold text-text flex items-center gap-2", children: [_jsx(PlugZap, { className: "w-5 h-5 text-primary" }), " Connectors"] }), _jsx("p", { className: "text-sm text-subtext mt-1", children: "Configure data sources \u00B7 auto-sync every 60 s \u00B7 LLM detects exceptions \u00B7 tickets raised automatically" })] }), _jsxs("div", { className: "bg-surface rounded-xl border border-border overflow-hidden shadow-sm", children: [_jsxs("div", { className: "px-5 py-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20", children: [_jsxs("div", { className: "relative w-full sm:max-w-xs", children: [_jsx(Search, { className: "w-4 h-4 text-subtext absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Search name or type", value: searchQuery, onChange: e => {
                                            setSearchQuery(e.target.value);
                                            setCurrentPage(1);
                                        }, className: "w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-bg text-sm text-text placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" })] }), _jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto justify-end", children: [_jsx("button", { onClick: () => {
                                            qc.invalidateQueries({ queryKey: ["connector"] });
                                            notify("↻ Refreshed connectors list");
                                        }, className: "p-2 rounded-lg border border-border bg-surface text-text hover:bg-muted transition-colors", title: "Refresh", children: _jsx(RefreshCw, { className: "w-4 h-4" }) }), _jsxs("button", { onClick: handleOpenAdd, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-sm", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add Connector"] })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border text-[11px] font-semibold tracking-wider text-subtext uppercase bg-muted/10", children: [_jsx("th", { className: "px-6 py-3 w-[20%]", children: "Connector Name" }), _jsx("th", { className: "px-6 py-3 w-[15%]", children: "Type" }), _jsx("th", { className: "px-6 py-3 w-[35%]", children: "Details & Config" }), _jsx("th", { className: "px-6 py-3 w-[15%]", children: "Status" }), _jsx("th", { className: "px-6 py-3 w-[15%] text-right", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: filteredRows.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 5, className: "px-6 py-10 text-center text-sm text-subtext", children: "No connectors match your search." }) })) : (paginatedRows.map(row => {
                                        const isExpanded = expandedRow === row.id;
                                        return (_jsxs(_Fragment, { children: [_jsxs("tr", { className: cn("hover:bg-muted/10 transition-colors cursor-pointer group", isExpanded && "bg-muted/5"), onClick: () => setExpandedRow(isExpanded ? null : row.id), children: [_jsx("td", { className: "px-6 py-4 font-medium text-sm text-text", children: _jsxs("div", { className: "flex items-center gap-2", children: [row.type === "CSV" ? (_jsx(FileText, { className: "w-4 h-4 text-green-500 shrink-0" })) : (_jsx(Server, { className: "w-4 h-4 text-blue-500 shrink-0" })), _jsx("span", { className: "group-hover:text-primary transition-colors", children: row.name })] }) }), _jsx("td", { className: "px-6 py-4 text-xs font-semibold text-subtext", children: _jsx("span", { className: cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold", row.type === "CSV" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"), children: row.type }) }), _jsx("td", { className: "px-6 py-4 text-xs text-subtext font-mono max-w-[200px] truncate", children: row.details }), _jsx("td", { className: "px-6 py-4", onClick: e => e.stopPropagation(), children: _jsx(Badge, { status: row.enabled ? "connected" : "disconnected" }) }), _jsx("td", { className: "px-6 py-4 text-right", onClick: e => e.stopPropagation(), children: _jsxs("div", { className: "flex items-center justify-end gap-1", children: [row.configured && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleSyncRow(row.id), disabled: !row.enabled, className: cn("p-1.5 rounded-lg border border-border text-subtext hover:text-text hover:bg-muted transition-all disabled:opacity-40 disabled:hover:bg-transparent", row.enabled && "text-success hover:text-success"), title: "Sync Now", children: _jsx(Play, { className: "w-3.5 h-3.5 fill-current" }) }), _jsx("button", { onClick: () => {
                                                                                    if (row.id === "csv")
                                                                                        togCsvMut.mutate();
                                                                                    else
                                                                                        togFtpMut.mutate();
                                                                                    notify(`✓ ${row.name} ${row.enabled ? "disabled" : "enabled"}`);
                                                                                }, className: cn("p-1.5 rounded-lg border border-border hover:bg-muted transition-all", row.enabled
                                                                                    ? "text-success border-success/30 hover:bg-success/5 hover:text-success"
                                                                                    : "text-subtext border-border"), title: row.enabled ? "Disable Connector" : "Enable Connector", children: _jsx(Power, { className: "w-3.5 h-3.5" }) })] })), _jsx("button", { onClick: () => handleEdit(row.id), className: "p-1.5 rounded-lg border border-border text-subtext hover:text-text hover:bg-muted transition-all", title: "Edit Configuration", children: _jsx(Edit3, { className: "w-3.5 h-3.5" }) })] }) })] }, row.id), isExpanded && (_jsx("tr", { className: "bg-muted/5 border-b border-border animate-slideDown", children: _jsx("td", { colSpan: 5, className: "px-6 py-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 p-2", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-semibold text-text mb-2.5 flex items-center gap-1.5", children: [_jsx(Settings2, { className: "w-3.5 h-3.5 text-primary" }), " Configuration Settings"] }), row.id === "csv" ? (_jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 text-xs space-y-2.5 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Local Watch File:" }), " ", _jsx("span", { className: "font-mono text-text bg-muted px-2 py-0.5 rounded", children: csvCfg?.file_path || "Not configured" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Delimiter:" }), " ", _jsxs("span", { className: "font-medium text-text", children: ["\"", csvCfg?.delimiter || ",", "\""] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Encoding:" }), " ", _jsx("span", { className: "font-medium text-text", children: csvCfg?.encoding || "UTF-8" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Plant Column:" }), " ", _jsx("span", { className: "font-medium text-text", children: csvCfg?.plant_col || "plant" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Machine Column:" }), " ", _jsx("span", { className: "font-medium text-text", children: csvCfg?.machine_col || "machine" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Skip Rows:" }), " ", _jsx("span", { className: "font-medium text-text", children: csvCfg?.skip_rows || 0 })] })] })) : (_jsxs("div", { className: "bg-surface border border-border rounded-xl p-4 text-xs space-y-2.5 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Server Host:" }), " ", _jsx("span", { className: "font-mono text-text bg-muted px-2 py-0.5 rounded", children: ftpCfg?.host || "Not configured" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Connection Port:" }), " ", _jsx("span", { className: "font-medium text-text", children: ftpCfg?.port || 21 })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Access Protocol:" }), " ", _jsx("span", { className: "font-semibold text-primary", children: ftpCfg?.protocol?.toUpperCase() || "FTP" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "System User:" }), " ", _jsx("span", { className: "font-medium text-text", children: ftpCfg?.username || "Not configured" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Remote Directory:" }), " ", _jsx("span", { className: "font-mono text-text", children: ftpCfg?.remote_dir || "/" })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-subtext", children: "Match Pattern:" }), " ", _jsx("span", { className: "font-mono text-text", children: ftpCfg?.file_pattern || "*.csv" })] })] })), row.enabled && (_jsx("div", { className: "mt-4", children: _jsx(SyncBar, { enabled: row.enabled, onSync: () => handleSyncRow(row.id), lastSync: row.id === "csv"
                                                                                    ? (csvCfg?.last_sync_at ? new Date(csvCfg.last_sync_at).toTimeString().slice(0, 5) : null)
                                                                                    : (ftpCfg?.last_sync_at ? new Date(ftpCfg.last_sync_at).toTimeString().slice(0, 5) : null), rows: row.id === "csv" ? csvRows : ftpRows }) }))] }), _jsx("div", { children: _jsx(LogDrawer, { name: row.id }) })] }) }) }))] }));
                                    })) })] }) }), _jsx(Pagination, { currentPage: currentPage, totalPages: totalPages, onPageChange: setCurrentPage })] }), isOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-all duration-300", children: [_jsxs("div", { className: "px-6 py-4 border-b border-border flex items-center justify-between bg-muted/10", children: [_jsxs("h2", { className: "text-base font-bold text-text flex items-center gap-2", children: [_jsx(Plus, { className: "w-5 h-5 text-primary" }), " ", modalMode === "add" ? "Add Connector" : "Edit Connector"] }), _jsx("button", { onClick: () => setIsOpen(false), className: "p-1 rounded-full text-subtext hover:text-text hover:bg-muted transition-all", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Connector Name *" }), _jsx("input", { type: "text", placeholder: "e.g. Manufacturing Lines Data", value: connectorName, onChange: e => setConnectorName(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" })] }), _jsxs("div", { className: "relative", children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Connector Type *" }), _jsxs("button", { type: "button", onClick: () => setIsTypeDropdownOpen(!isTypeDropdownOpen), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20", children: [_jsx("span", { className: "flex items-center gap-2", children: activeType === "csv" ? (_jsxs(_Fragment, { children: [_jsx(FileText, { className: "w-4 h-4 text-green-500" }), _jsx("span", { children: "CSV File" })] })) : (_jsxs(_Fragment, { children: [_jsx(Server, { className: "w-4 h-4 text-blue-500" }), _jsx("span", { children: "FTP Server" })] })) }), _jsx(ChevronDown, { className: "w-4.5 h-4.5 text-subtext" })] }), isTypeDropdownOpen && (_jsxs("div", { className: "absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-xl overflow-hidden divide-y divide-border animate-slideDown", children: [_jsxs("button", { type: "button", onClick: () => { setActiveType("csv"); setIsTypeDropdownOpen(false); }, className: "w-full text-left px-3 py-2.5 text-sm text-text hover:bg-muted/40 transition-colors flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4 text-green-500" }), "CSV File"] }), activeType === "csv" && _jsx(Check, { className: "w-4 h-4 text-primary font-bold" })] }), _jsxs("button", { type: "button", onClick: () => { setActiveType("ftp"); setIsTypeDropdownOpen(false); }, className: "w-full text-left px-3 py-2.5 text-sm text-text hover:bg-muted/40 transition-colors flex items-center justify-between", children: [_jsxs("span", { className: "flex items-center gap-2", children: [_jsx(Server, { className: "w-4 h-4 text-blue-500" }), "FTP Server"] }), activeType === "ftp" && _jsx(Check, { className: "w-4 h-4 text-primary font-bold" })] })] }))] }), activeType === "csv" ? (
                                /* CSV INTERACTIVE INTERFACE */
                                _jsx("div", { className: "space-y-4 pt-1 animate-fadeIn", children: _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "CSV Source File *" }), !csvFileName ? (_jsxs("div", { onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: () => fileInputRef.current?.click(), className: cn("border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200", isDragging
                                                    ? "border-primary bg-primary/5 scale-[1.01]"
                                                    : "border-border bg-bg/40 hover:bg-bg hover:border-border-hover"), children: [_jsx("input", { type: "file", ref: fileInputRef, className: "hidden", accept: ".csv", onChange: (e) => handleFileSelect(e.target.files?.[0]) }), _jsx(UploadCloud, { className: "w-9 h-9 text-subtext mb-2" }), _jsx("p", { className: "text-xs font-semibold text-text text-center", children: "Drag and drop or browse files" }), _jsx("p", { className: "text-[10px] text-subtext mt-1 text-center", children: "Supports standard comma-separated .csv files" })] })) : (_jsxs("div", { className: "rounded-xl border border-success/30 bg-success/5 px-4 py-3 flex items-center justify-between animate-fadeIn", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-success/15 text-success flex items-center justify-center", children: _jsx(FileText, { className: "w-4.5 h-4.5" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-xs font-semibold text-text truncate max-w-[200px]", children: csvFileName }), _jsxs("p", { className: "text-[10px] text-subtext", children: [csvFileSize ? `${(csvFileSize / 1024).toFixed(1)} KB` : "Attached file", " \u00B7 Ready to save"] })] })] }), _jsx("button", { type: "button", onClick: () => {
                                                            setCsvFile(null);
                                                            setCsvFileName("");
                                                            setCsvFileSize(null);
                                                            setCsvFilePath("");
                                                        }, className: "p-1 rounded-full hover:bg-muted text-subtext hover:text-text transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }))] }) })) : (
                                /* FTP INTERACTIVE INTERFACE */
                                _jsxs("div", { className: "space-y-4 pt-1 animate-fadeIn", children: [_jsxs("div", { className: "grid grid-cols-[1fr_90px] gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "FTP Host *" }), _jsx("input", { type: "text", placeholder: "ftp.example.com", value: host, onChange: e => setHost(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Port" }), _jsx("input", { type: "number", value: port, onChange: e => setPort(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Username *" }), _jsx("input", { type: "text", value: username, onChange: e => setUsername(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none", autoComplete: "username" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Password" }), _jsx("input", { type: "password", placeholder: modalMode === "edit" ? "••••••••" : "Optional password", value: password, onChange: e => setPassword(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none", autoComplete: "new-password" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Remote Directory" }), _jsx("input", { type: "text", value: remoteDir, onChange: e => setRemoteDir(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "File Pattern" }), _jsx("input", { type: "text", value: filePattern, onChange: e => setFilePattern(e.target.value), className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-xs font-semibold text-subtext block mb-1", children: "Protocol" }), _jsx("select", { className: "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none", value: protocol, onChange: e => setProtocol(e.target.value), children: ["FTP", "FTPS (explicit)", "FTPS (implicit)", "SFTP"].map(p => _jsx("option", { children: p }, p)) })] })] })] }))] }), _jsxs("div", { className: "px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10", children: [_jsxs("button", { type: "button", onClick: handleTest, disabled: activeType === "csv" ? testCsvMut.isPending : testFtpMut.isPending, className: "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-surface hover:bg-muted text-text rounded-lg transition-colors disabled:opacity-50", children: [_jsx(Wifi, { className: "w-3.5 h-3.5 text-primary" }), (activeType === "csv" ? testCsvMut.isPending : testFtpMut.isPending) ? "Testing…" : "Test Connection"] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setIsOpen(false), className: "px-4 py-1.5 text-xs font-semibold hover:bg-muted text-subtext hover:text-text rounded-lg transition-all", children: "Cancel" }), _jsx("button", { type: "button", onClick: handleSave, disabled: activeType === "csv" ? saveCsvMut.isPending : saveFtpMut.isPending, className: "px-4 py-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-lg transition-all shadow-sm disabled:opacity-50", children: (activeType === "csv" ? saveCsvMut.isPending : saveFtpMut.isPending) ? "Saving…" : "Save" })] })] })] }) }))] }));
}
