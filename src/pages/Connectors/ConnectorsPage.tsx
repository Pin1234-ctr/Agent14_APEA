// src/pages/Connectors/ConnectorsPage.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectorApi } from "@/services/api/endpoints";
import { 
  FileText, Server, RefreshCw, Plug, Wifi, ChevronDown, ChevronUp,
  CheckCircle, XCircle, PlugZap, Database, Brain, AlertTriangle,
  TrendingUp, Ticket, Lightbulb, Search, Plus, Trash2, Edit3, 
  UploadCloud, Play, Power, Check, X, File, AlertCircle, Info, Settings2
} from "lucide-react";
import { cn } from "@/utils/cn";

// ── Sync countdown ────────────────────────────────────────────────────────────
function SyncBar({ enabled, onSync, lastSync, rows }: {
  enabled: boolean; onSync: () => void; lastSync?: string | null; rows: number;
}) {
  const [cd, setCd] = useState(60);
  const ref = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    if (!enabled) { clearInterval(ref.current); setCd(60); return; }
    setCd(60);
    ref.current = setInterval(() => {
      setCd(c => { if (c <= 1) { onSync(); return 60; } return c - 1; });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="rounded-lg bg-muted px-3 py-2 mt-2">
      <div className="flex items-center justify-between text-xs text-subtext mb-1">
        <span>
          Next sync in <strong className="text-text">{cd}s</strong>
          {lastSync && <> · Last: <strong className="text-text">{lastSync}</strong></>}
          {rows > 0 && <> · Rows: <strong className="text-text">{rows.toLocaleString()}</strong></>}
        </span>
        <button onClick={onSync} className="flex items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 text-[10px] hover:bg-muted transition-colors text-text">
          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Sync now
        </button>
      </div>
      <div className="h-1 rounded-full bg-border overflow-hidden">
        <div className="h-full bg-success rounded-full transition-all duration-1000" style={{ width: `${Math.round(((60-cd)/60)*100)}%` }} />
      </div>
    </div>
  );
}

// ── Log drawer ────────────────────────────────────────────────────────────────
function LogDrawer({ name }: { name: string }) {
  const [open, setOpen] = useState(true); // Default open in expanded row
  const { data } = useQuery({
    queryKey: ["connector-logs", name],
    queryFn:  () => connectorApi.logs(name),
    enabled:  open,
  });
  const logs: any[] = data || [];
  return (
    <div className="border border-border rounded-xl bg-bg/50 overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-text bg-muted/40 hover:bg-muted/60 transition-colors">
        <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 text-primary" /> Sync History ({logs.length})</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-subtext" /> : <ChevronDown className="w-3.5 h-3.5 text-subtext" />}
      </button>
      {open && (
        <div className="px-4 py-2 max-h-[180px] overflow-y-auto divide-y divide-border">
          {logs.length === 0 && <p className="text-xs text-subtext py-3 text-center">No history recorded yet.</p>}
          {logs.map((l, i) => (
            <div key={i} className="flex items-center gap-2 py-2 text-xs">
              <span className="font-mono text-subtext w-[70px] shrink-0">{l.started_at ? new Date(l.started_at).toTimeString().slice(0,8) : "—"}</span>
              {l.status === "success" ? <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-danger shrink-0" />}
              <span className="text-text truncate max-w-[150px] md:max-w-[250px]">{l.error || "Sync completed successfully"}</span>
              <span className="ml-auto font-mono text-success font-medium shrink-0">+{l.upserted || 0} rows</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Badge status helper ───────────────────────────────────────────────────────
function Badge({ status }: { status: "connected"|"disconnected"|"syncing" }) {
  const cls = { 
    connected: "bg-success/15 text-success border-success/30", 
    disconnected: "bg-muted text-subtext border-border", 
    syncing: "bg-primary/15 text-primary border-primary/30" 
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all", cls[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", { 
        "bg-success": status === "connected",
        "bg-subtext": status === "disconnected",
        "bg-primary animate-pulse": status === "syncing" 
      })} />
      {status === "connected" ? "Connected" : status === "syncing" ? "Syncing…" : "Not Configured"}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function ConnectorsPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<"csv" | "ftp" | null>(null);
  const [toast, setToast] = useState("");

  const notify = (m: string) => { 
    setToast(m); 
    setTimeout(() => setToast(""), 3000); 
  };

  // Queries
  const { data: csvCfg } = useQuery({ queryKey: ["connector","csv"], queryFn: () => connectorApi.get("csv") });
  const { data: ftpCfg } = useQuery({ queryKey: ["connector","ftp"], queryFn: () => connectorApi.get("ftp") });

  // Mutations
  const saveCsvMut = useMutation({ mutationFn: (p: any) => connectorApi.save("csv", p), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector","csv"] }) });
  const saveFtpMut = useMutation({ mutationFn: (p: any) => connectorApi.save("ftp", p), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector","ftp"] }) });
  
  const testCsvMut = useMutation({ mutationFn: () => connectorApi.test("csv") });
  const testFtpMut = useMutation({ mutationFn: () => connectorApi.test("ftp") });

  const syncCsvMut = useMutation({ mutationFn: () => connectorApi.sync("csv"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector-logs","csv"] }) });
  const syncFtpMut = useMutation({ mutationFn: () => connectorApi.sync("ftp"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector-logs","ftp"] }) });

  const togCsvMut  = useMutation({ mutationFn: () => connectorApi.toggle("csv"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector","csv"] }) });
  const togFtpMut  = useMutation({ mutationFn: () => connectorApi.toggle("ftp"), onSuccess: () => qc.invalidateQueries({ queryKey: ["connector","ftp"] }) });

  // Local rows count
  const [csvRows, setCsvRows] = useState(0);
  const [ftpRows, setFtpRows] = useState(0);

  // Modal form states
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [connectorName, setConnectorName] = useState("");
  const [activeType, setActiveType] = useState<"csv" | "ftp">("csv");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // CSV form inputs
  const [csvFiles, setCsvFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "analyzing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
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
  const handleEdit = (type: "csv" | "ftp") => {
    setModalMode("edit");
    setActiveType(type);
    setConnectorName(type === "csv" ? "CSV Connector" : "FTP Connector");
    
    if (type === "csv") {
      setCsvFiles([]);
      setUploadStatus("idle");
      setErrorMessage("");
    } else {
      if (ftpCfg?.host) {
        setHost(ftpCfg.host);
        setPort(String(ftpCfg.port || 21));
        setUsername(ftpCfg.username || "");
        setPassword("");
        setRemoteDir(ftpCfg.remote_dir || "/");
        setFilePattern(ftpCfg.file_pattern || "*.csv");
        setProtocol((ftpCfg.protocol || "ftp").toUpperCase());
      } else {
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
    setCsvFiles([]);
    setUploadStatus("idle");
    setErrorMessage("");

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
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith(".csv"));
    if (csvFiles.length > 0) {
      handleAutoProcess(csvFiles);
    } else if (files.length > 0) {
      notify("⚠ Only CSV files are supported");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith(".csv"));
    if (csvFiles.length > 0) {
      handleAutoProcess(csvFiles);
    } else {
      notify("⚠ Only CSV files are supported");
    }
  };

  // Auto processing handler for CSV upload + analysis
  const handleAutoProcess = async (files: File[]) => {
    if (files.length === 0) return;
    
    const name = connectorName || "CSV Connector";
    if (!connectorName) {
      setConnectorName("CSV Connector");
    }

    setUploadStatus("uploading");
    setCsvFiles(files);
    setErrorMessage("");

    try {
      // Build FormData payload
      const formData = new FormData();
      files.forEach((file) => {
       formData.append("files", file);
      });

      // Save/Upload CSV via FormData payload
     await connectorApi.uploadCsv(formData);

      // Trigger automatic analysis/sync
      setUploadStatus("analyzing");
      const r = await syncCsvMut.mutateAsync();
      setCsvRows(x => x + (r?.upserted || 0));

      setUploadStatus("success");
      notify(`✓ Uploaded and analyzed ${files.length} file(s) successfully!`);

      // Close modal after short visual feedback
      setTimeout(() => {
        setIsOpen(false);
        setUploadStatus("idle");
        setCsvFiles([]);
      }, 1500);
    } catch (err: any) {
      setUploadStatus("error");
      setErrorMessage(err.message || "Failed to process CSV files");
      notify(`✗ Processing failed: ${err.message || err}`);
    }
  };

  // Save handling
  const handleSave = async () => {
    if (!connectorName) {
      notify("⚠ Connector name is required");
      return;
    }

    if (activeType === "csv") {
      return; // Handled automatically by handleAutoProcess
    }

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
    } catch (err: any) {
      notify(`✗ Save failed: ${err.message || err}`);
    }
  };

  // Test handling
  const handleTest = async () => {
    if (activeType === "csv") {
      return; // CSV is handled by upload
    }

    if (!host || !username) {
      notify("⚠ Host and username required to test");
      return;
    }
    try {
      const r = await testFtpMut.mutateAsync();
      notify(r.ok ? `✓ ${r.message}` : `✗ ${r.message}`);
    } catch (e) {
      notify("✗ Connection test failed");
    }
  };

  // Sync now trigger
  const handleSyncRow = async (type: "csv" | "ftp") => {
    if (type === "csv") {
      try {
        const r = await syncCsvMut.mutateAsync();
        setCsvRows(x => x + (r?.upserted || 0));
        notify(`↻ Synced CSV — ${r?.upserted || 0} rows`);
      } catch (e) {
        notify("✗ CSV Sync failed");
      }
    } else {
      try {
        const r = await syncFtpMut.mutateAsync();
        setFtpRows(x => x + (r?.upserted || 0));
        notify(`↻ Synced FTP — ${r?.upserted || 0} rows`);
      } catch (e) {
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
  const filteredRows = connectorRows.filter(row => 
    row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-text text-bg text-xs px-4 py-2.5 rounded-lg shadow-lg font-medium animate-fadeIn">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text flex items-center gap-2">
          <PlugZap className="w-5 h-5 text-primary" /> Connectors
        </h1>
        <p className="text-sm text-subtext mt-1">
          Configure data sources · auto-sync every 60 s · LLM detects exceptions · tickets raised automatically
        </p>
      </div>

      {/* Table Container */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-subtext absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or type"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-bg text-sm text-text placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button 
              onClick={() => {
                qc.invalidateQueries({ queryKey: ["connector"] });
                notify("↻ Refreshed connectors list");
              }}
              className="p-2 rounded-lg border border-border bg-surface text-text hover:bg-muted transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Connector
            </button>
          </div>
        </div>

        {/* Connectors Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold tracking-wider text-subtext uppercase bg-muted/10">
                <th className="px-6 py-3 w-[20%]">Connector Name</th>
                <th className="px-6 py-3 w-[15%]">Type</th>
                <th className="px-6 py-3 w-[35%]">Details & Config</th>
                <th className="px-6 py-3 w-[15%]">Status</th>
                <th className="px-6 py-3 w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-subtext">
                    No connectors match your search.
                  </td>
                </tr>
              ) : (
                filteredRows.map(row => {
                  const isExpanded = expandedRow === row.id;
                  return (
                    <>
                      <tr 
                        key={row.id} 
                        className={cn(
                          "hover:bg-muted/10 transition-colors cursor-pointer group",
                          isExpanded && "bg-muted/5"
                        )}
                        onClick={() => setExpandedRow(isExpanded ? null : (row.id as any))}
                      >
                        {/* Name */}
                        <td className="px-6 py-4 font-medium text-sm text-text">
                          <div className="flex items-center gap-2">
                            {row.type === "CSV" ? (
                              <FileText className="w-4 h-4 text-green-500 shrink-0" />
                            ) : (
                              <Server className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <span className="group-hover:text-primary transition-colors">{row.name}</span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4 text-xs font-semibold text-subtext">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                            row.type === "CSV" ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          )}>
                            {row.type}
                          </span>
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4 text-xs text-subtext font-mono max-w-[200px] truncate">
                          {row.details}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                          <Badge status={row.enabled ? "connected" : "disconnected"} />
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {row.configured && (
                              <>
                                <button
                                  onClick={() => handleSyncRow(row.id as any)}
                                  disabled={!row.enabled}
                                  className={cn(
                                    "p-1.5 rounded-lg border border-border text-subtext hover:text-text hover:bg-muted transition-all disabled:opacity-40 disabled:hover:bg-transparent",
                                    row.enabled && "text-success hover:text-success"
                                  )}
                                  title="Sync Now"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (row.id === "csv") togCsvMut.mutate();
                                    else togFtpMut.mutate();
                                    notify(`✓ ${row.name} ${row.enabled ? "disabled" : "enabled"}`);
                                  }}
                                  className={cn(
                                    "p-1.5 rounded-lg border border-border hover:bg-muted transition-all",
                                    row.enabled 
                                      ? "text-success border-success/30 hover:bg-success/5 hover:text-success" 
                                      : "text-subtext border-border"
                                  )}
                                  title={row.enabled ? "Disable Connector" : "Enable Connector"}
                                >
                                  <Power className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleEdit(row.id as any)}
                              className="p-1.5 rounded-lg border border-border text-subtext hover:text-text hover:bg-muted transition-all"
                              title="Edit Configuration"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable configuration & logs section */}
                      {isExpanded && (
                        <tr className="bg-muted/5 border-b border-border animate-slideDown">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                              {/* Configuration stats */}
                              <div>
                                <h4 className="text-xs font-semibold text-text mb-2.5 flex items-center gap-1.5">
                                  <Settings2 className="w-3.5 h-3.5 text-primary" /> Configuration Settings
                                </h4>
                                
                                {row.id === "csv" ? (
                                  <div className="bg-surface border border-border rounded-xl p-4 text-xs space-y-2.5 shadow-sm">
                                    <div className="flex justify-between items-center"><span className="text-subtext">Connector Type:</span> <span className="font-medium text-text">CSV Multi-File Upload</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Auto-Sync / Analysis:</span> <span className="font-semibold text-success flex items-center gap-1">Enabled <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /></span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Last Uploaded File:</span> <span className="font-mono text-text bg-muted px-2 py-0.5 rounded truncate max-w-[220px]">{csvCfg?.file_path || "No uploads yet"}</span></div>
                                    {csvCfg?.last_sync_at && (
                                      <div className="flex justify-between items-center"><span className="text-subtext">Last Sync Processed:</span> <span className="font-medium text-text">{new Date(csvCfg.last_sync_at).toLocaleString()}</span></div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="bg-surface border border-border rounded-xl p-4 text-xs space-y-2.5 shadow-sm">
                                    <div className="flex justify-between items-center"><span className="text-subtext">Server Host:</span> <span className="font-mono text-text bg-muted px-2 py-0.5 rounded">{ftpCfg?.host || "Not configured"}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Connection Port:</span> <span className="font-medium text-text">{ftpCfg?.port || 21}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Access Protocol:</span> <span className="font-semibold text-primary">{ftpCfg?.protocol?.toUpperCase() || "FTP"}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">System User:</span> <span className="font-medium text-text">{ftpCfg?.username || "Not configured"}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Remote Directory:</span> <span className="font-mono text-text">{ftpCfg?.remote_dir || "/"}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-subtext">Match Pattern:</span> <span className="font-mono text-text">{ftpCfg?.file_pattern || "*.csv"}</span></div>
                                  </div>
                                )}

                                {/* Inline Countdown Timer */}
                                {row.enabled && (
                                  <div className="mt-4">
                                    <SyncBar 
                                      enabled={row.enabled} 
                                      onSync={() => handleSyncRow(row.id as any)} 
                                      lastSync={row.id === "csv" 
                                        ? (csvCfg?.last_sync_at ? new Date(csvCfg.last_sync_at).toTimeString().slice(0,5) : null)
                                        : (ftpCfg?.last_sync_at ? new Date(ftpCfg.last_sync_at).toTimeString().slice(0,5) : null)
                                      } 
                                      rows={row.id === "csv" ? csvRows : ftpRows} 
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Sync logs column */}
                              <div>
                                <LogDrawer name={row.id} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modern Add / Edit Connector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          {/* Modal Container */}
          <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-lg overflow-hidden transform scale-100 transition-all duration-300">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/10">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> {modalMode === "add" ? "Add Connector" : "Edit Connector"}
              </h2>
              {(activeType !== "csv" || (uploadStatus === "idle" || uploadStatus === "error")) && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-subtext hover:text-text hover:bg-muted transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Connector Name */}
              <div>
                <label className="text-xs font-semibold text-subtext block mb-1">Connector Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Manufacturing Lines Data"
                  value={connectorName}
                  onChange={e => setConnectorName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                />
              </div>

              {/* Connector Type Dropdown */}
              <div className="relative">
                <label className="text-xs font-semibold text-subtext block mb-1">Connector Type *</label>
                <button 
                  type="button"
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="flex items-center gap-2">
                    {activeType === "csv" ? (
                      <>
                        <FileText className="w-4 h-4 text-green-500" />
                        <span>CSV File</span>
                      </>
                    ) : (
                      <>
                        <Server className="w-4 h-4 text-blue-500" />
                        <span>FTP Server</span>
                      </>
                    )}
                  </span>
                  <ChevronDown className="w-4.5 h-4.5 text-subtext" />
                </button>
                
                {isTypeDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-xl overflow-hidden divide-y divide-border animate-slideDown">
                    <button
                      type="button"
                      onClick={() => { setActiveType("csv"); setIsTypeDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-text hover:bg-muted/40 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-500" />
                        CSV File
                      </span>
                      {activeType === "csv" && <Check className="w-4 h-4 text-primary font-bold" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveType("ftp"); setIsTypeDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm text-text hover:bg-muted/40 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Server className="w-4 h-4 text-blue-500" />
                        FTP Server
                      </span>
                      {activeType === "ftp" && <Check className="w-4 h-4 text-primary font-bold" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Conditional Rendering based on selected dropdown */}
              {activeType === "csv" ? (
                /* CSV DYNAMIC AUTO-PROCESSOR INTERFACE */
                <div className="space-y-4 pt-1 animate-fadeIn">
                  {uploadStatus === "idle" && (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-subtext block">CSV Source Files *</label>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                          isDragging 
                            ? "border-primary bg-primary/5 scale-[1.01]" 
                            : "border-border bg-bg/40 hover:bg-bg hover:border-border/60"
                        )}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".csv"
                          multiple
                          onChange={handleFileSelect}
                        />
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                          <UploadCloud className="w-6 h-6 animate-pulse" />
                        </div>
                        <p className="text-sm font-semibold text-text text-center">
                          Drag and drop or browse files
                        </p>
                        <p className="text-xs text-subtext mt-1.5 text-center">
                          Supports multiple .csv files
                        </p>
                        <p className="text-[10px] text-subtext mt-1 text-center font-mono">
                          Automatic anomaly analysis starts instantly upon drop
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadStatus === "uploading" && (
                    <div className="flex flex-col items-center justify-center p-6 border border-border rounded-xl bg-muted/10 animate-pulse">
                      <RefreshCw className="w-10 h-10 text-primary animate-spin mb-3" />
                      <h3 className="text-sm font-bold text-text mb-1">Uploading Files...</h3>
                      <p className="text-xs text-subtext text-center mb-4">Transferring your data securely to the processing pipeline.</p>
                      <div className="w-full bg-border rounded-full h-1.5 overflow-hidden mb-3">
                        <div className="bg-primary h-full animate-progress" />
                      </div>
                      <div className="w-full max-h-[120px] overflow-y-auto space-y-1.5 px-2">
                        {csvFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-subtext py-1.5 px-2.5 rounded-lg bg-surface border border-border">
                            <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate max-w-[200px] font-mono text-text">{file.name}</span>
                            <span className="ml-auto font-mono text-[10px]">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {uploadStatus === "analyzing" && (
                    <div className="flex flex-col items-center justify-center p-6 border border-border rounded-xl bg-muted/10">
                      <div className="relative mb-3 flex items-center justify-center">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-ping" />
                        <Brain className="w-10 h-10 text-primary relative animate-pulse" />
                      </div>
                      <h3 className="text-sm font-bold text-text mb-1">Analyzing Data & Running Sync</h3>
                      <p className="text-xs text-subtext text-center">Parsing records, detecting machine anomalies, and running LLM checks...</p>
                      <div className="flex items-center gap-1.5 mt-4 text-[10px] font-semibold text-primary uppercase tracking-wider animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Processing pipeline active
                      </div>
                    </div>
                  )}

                  {uploadStatus === "success" && (
                    <div className="flex flex-col items-center justify-center p-6 border border-success/30 rounded-xl bg-success/5 text-center">
                      <div className="w-12 h-12 rounded-full bg-success/20 text-success flex items-center justify-center mb-3 scale-110 transition-transform">
                        <Check className="w-6 h-6 stroke-[3]" />
                      </div>
                      <h3 className="text-sm font-bold text-text mb-1">Upload & Sync Successful!</h3>
                      <p className="text-xs text-success/80">Successfully processed and imported {csvFiles.length} file(s).</p>
                      <p className="text-[10px] text-subtext mt-2 font-mono">Closing wizard...</p>
                    </div>
                  )}

                  {uploadStatus === "error" && (
                    <div className="flex flex-col items-center justify-center p-6 border border-danger/30 rounded-xl bg-danger/5 text-center">
                      <div className="w-12 h-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mb-3">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-text mb-1">Processing Failed</h3>
                      <p className="text-xs text-danger/80 max-w-xs">{errorMessage || "An unexpected error occurred during processing."}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadStatus("idle");
                          setCsvFiles([]);
                        }}
                        className="mt-4 px-4 py-1.5 text-xs font-semibold bg-bg hover:bg-muted text-text border border-border rounded-lg transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* FTP INTERACTIVE INTERFACE */
                <div className="space-y-4 pt-1 animate-fadeIn">
                  <div className="grid grid-cols-[1fr_90px] gap-3">
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">FTP Host *</label>
                      <input
                        type="text"
                        placeholder="ftp.example.com"
                        value={host}
                        onChange={e => setHost(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">Port</label>
                      <input
                        type="number"
                        value={port}
                        onChange={e => setPort(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">Username *</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none"
                        autoComplete="username"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">Password</label>
                      <input
                        type="password"
                        placeholder={modalMode === "edit" ? "••••••••" : "Optional password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-subtext block mb-1">Remote Directory</label>
                    <input
                      type="text"
                      value={remoteDir}
                      onChange={e => setRemoteDir(e.target.value)}
                      className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">File Pattern</label>
                      <input
                        type="text"
                        value={filePattern}
                        onChange={e => setFilePattern(e.target.value)}
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-subtext block mb-1">Protocol</label>
                      <select 
                        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none"
                        value={protocol}
                        onChange={e => setProtocol(e.target.value)}
                      >
                        {["FTP","FTPS (explicit)","FTPS (implicit)","SFTP"].map(p=><option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {activeType !== "csv" && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
                <button 
                  type="button"
                  onClick={handleTest}
                  disabled={testFtpMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-surface hover:bg-muted text-text rounded-lg transition-colors disabled:opacity-50"
                >
                  <Wifi className="w-3.5 h-3.5 text-primary" /> 
                  {testFtpMut.isPending ? "Testing…" : "Test Connection"}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-1.5 text-xs font-semibold hover:bg-muted text-subtext hover:text-text rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveFtpMut.isPending}
                    className="px-4 py-1.5 text-xs font-bold bg-primary hover:bg-primary/95 text-white rounded-lg transition-all shadow-sm disabled:opacity-50"
                  >
                    {saveFtpMut.isPending ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}