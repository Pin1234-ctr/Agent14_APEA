// src/services/api/endpoints.ts
import API from "./client";

const unwrap = (r: any) => r.data.data;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login:    (email: string, password: string) =>
    API.post("/auth/login", { email, password }).then(unwrap),
  me:       () => API.get("/auth/me").then(unwrap),
  logout:   () => API.post("/auth/logout"),
  register: (p: any) => API.post("/auth/register", p).then(unwrap),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats:      () => API.get("/dashboard/stats").then(unwrap),
  severity:   () => API.get("/dashboard/severity").then(unwrap),
  timeseries: (hours = 24) => API.get("/dashboard/timeseries", { params: { hours } }).then(unwrap),
  recent:     (limit = 10) => API.get("/dashboard/recent-deviations", { params: { limit } }).then(unwrap),
  sla:        () => API.get("/dashboard/sla").then(unwrap),
};

// ── Exceptions / Deviations ───────────────────────────────────────────────────
export const exceptionApi = {
  list:         (p?: any) => API.get("/deviations", { params: p }).then(unwrap),
  get:          (id: number) => API.get(`/deviations/${id}`).then(unwrap),
  updateStatus: (id: number, status: string) =>
    API.patch(`/deviations/${id}/status`, { status }).then(unwrap),
};

// ── Tickets ───────────────────────────────────────────────────────────────────
export const ticketApi = {
  list:         (p?: any) => API.get("/tickets", { params: p }).then(unwrap),
  get:          (id: number) => API.get(`/tickets/${id}`).then(unwrap),
  create:       (p: any)    => API.post("/tickets", p).then(unwrap),
  updateStatus: (id: number, status: string) =>
    API.patch(`/tickets/${id}/status`, { status }).then(unwrap),
};

// ── RCA ───────────────────────────────────────────────────────────────────────
export const rcaApi = {
  list:     ()              => API.get("/rca").then(unwrap),
  get:      (id: number)    => API.get(`/rca/${id}`).then(unwrap),
  generate: (deviation_id: number) =>
    API.post("/rca/generate", { deviation_id }).then(unwrap),
};

// ── Connectors ────────────────────────────────────────────────────────────────
export const connectorApi = {
  get:    (name: string)          => API.get(`/connectors/${name}`).then(unwrap),
  save:   (name: string, p: any)  => API.put(`/connectors/${name}`, p).then(unwrap),
    uploadCsv: (formData: FormData) =>
    API.post("csv/deviation/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }).then(unwrap),
  test:   (name: string)          => API.post(`/connectors/${name}/test`).then(unwrap),
  sync:   (name: string)          => API.post(`/connectors/${name}/sync`).then(unwrap),
  logs:   (name: string, limit = 20) =>
    API.get(`/connectors/${name}/logs`, { params: { limit } }).then(unwrap),
  toggle: (name: string)          => API.post(`/connectors/${name}/toggle`).then(unwrap),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationApi = {
  list:        (limit = 50) => API.get("/notifications", { params: { limit } }).then(unwrap),
  markRead:    (id: number)  => API.post(`/notifications/${id}/read`).then(unwrap),
  unreadCount: ()            => API.get("/notifications/unread-count").then(unwrap),
};

// ── Chat ──────────────────────────────────────────────────────────────────────
export const chatApi = {
  send:    (message: string, session_id?: string) =>
    API.post("/chat/send", { message, session_id }).then(unwrap),
  history: (session_id: string) =>
    API.get(`/chat/history/${session_id}`).then(unwrap),
};

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportApi = {
  list:     ()              => API.get("/reports").then(unwrap),
  generate: (fmt = "pdf", days = 7) =>
    API.get("/reports/generate", { params: { format: fmt, days }, responseType: "blob" }),
};
