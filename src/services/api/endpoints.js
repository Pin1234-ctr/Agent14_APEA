// src/services/api/endpoints.ts
import API from "./client";
const unwrap = (r) => r.data.data;
// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
    login: (email, password) => API.post("/auth/login", { email, password }).then(unwrap),
    me: () => API.get("/auth/me").then(unwrap),
    logout: () => API.post("/auth/logout"),
    register: (p) => API.post("/auth/register", p).then(unwrap),
};
// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
    stats: () => API.get("/dashboard/stats").then(unwrap),
    severity: () => API.get("/dashboard/severity").then(unwrap),
    timeseries: (hours = 24) => API.get("/dashboard/timeseries", { params: { hours } }).then(unwrap),
    recent: (limit = 10) => API.get("/dashboard/recent-deviations", { params: { limit } }).then(unwrap),
    sla: () => API.get("/dashboard/sla").then(unwrap),
};
// ── Exceptions / Deviations ───────────────────────────────────────────────────
export const exceptionApi = {
    list: (p) => API.get("/deviations", { params: p }).then(unwrap),
    get: (id) => API.get(`/deviations/${id}`).then(unwrap),
    updateStatus: (id, status) => API.patch(`/deviations/${id}/status`, { status }).then(unwrap),
};
// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketApi = {
    list: (p) => API.get("/tickets", { params: p }).then(unwrap),
    get: (id) => API.get(`/tickets/${id}`).then(unwrap),
    create: (p) => API.post("/tickets", p).then(unwrap),
    updateStatus: (id, status) => API.patch(`/tickets/${id}/status`, { status }).then(unwrap),
};
// ── RCA ───────────────────────────────────────────────────────────────────────
export const rcaApi = {
    list: () => API.get("/rca").then(unwrap),
    get: (id) => API.get(`/rca/${id}`).then(unwrap),
    generate: (deviation_id) => API.post("/rca/generate", { deviation_id }).then(unwrap),
};
// ── Connectors ────────────────────────────────────────────────────────────────
export const connectorApi = {
    get: (name) => API.get(`/connectors/${name}`).then(unwrap),
    save: (name, p) => API.put(`/connectors/${name}`, p).then(unwrap),
    test: (name) => API.post(`/connectors/${name}/test`).then(unwrap),
    sync: (name) => API.post(`/connectors/${name}/sync`).then(unwrap),
    logs: (name, limit = 20) => API.get(`/connectors/${name}/logs`, { params: { limit } }).then(unwrap),
    toggle: (name) => API.post(`/connectors/${name}/toggle`).then(unwrap),
};
// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
    list: (limit = 50) => API.get("/notifications", { params: { limit } }).then(unwrap),
    markRead: (id) => API.post(`/notifications/${id}/read`).then(unwrap),
    unreadCount: () => API.get("/notifications/unread-count").then(unwrap),
};
// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
    send: (message, session_id) => API.post("/chat/send", { message, session_id }).then(unwrap),
    history: (session_id) => API.get(`/chat/history/${session_id}`).then(unwrap),
};
// ── Reports ───────────────────────────────────────────────────────────────────
export const reportApi = {
    list: () => API.get("/reports").then(unwrap),
    generate: (fmt = "pdf", days = 7) => API.get("/reports/generate", { params: { format: fmt, days }, responseType: "blob" }),
};
