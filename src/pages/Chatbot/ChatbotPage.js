import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Chatbot/ChatbotPage.tsx
import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/services/api/endpoints";
import { MessagesSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/utils/cn";
export function ChatbotPage() {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [session] = useState(() => Math.random().toString(36).slice(2));
    const bottomRef = useRef(null);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
    const send = async () => {
        if (!input.trim() || loading)
            return;
        const text = input.trim();
        setInput("");
        setMsgs(m => [...m, { role: "user", content: text }]);
        setLoading(true);
        try {
            const r = await chatApi.send(text, session);
            setMsgs(m => [...m, { role: "assistant", content: r.reply }]);
        }
        catch {
            setMsgs(m => [...m, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "flex flex-col h-full max-h-[calc(100vh-3.5rem)]", children: [_jsxs("div", { className: "px-6 py-4 border-b border-border", children: [_jsxs("h1", { className: "text-lg font-semibold text-text flex items-center gap-2", children: [_jsx(MessagesSquare, { className: "w-5 h-5" }), " APEA Assistant"] }), _jsx("p", { className: "text-sm text-subtext", children: "Ask about exceptions, tickets, SOPs, and production data" })] }), _jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-4 space-y-4", children: [msgs.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-3 text-center", children: [_jsx(Bot, { className: "w-10 h-10 text-subtext" }), _jsx("p", { className: "text-sm text-subtext", children: "Ask me anything about production exceptions, tickets, or SOPs." })] })), msgs.map((m, i) => (_jsxs("div", { className: cn("flex gap-3 max-w-3xl", m.role === "user" ? "ml-auto flex-row-reverse" : ""), children: [_jsx("div", { className: cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs", m.role === "user" ? "bg-primary text-primary-fg" : "bg-muted text-subtext"), children: m.role === "user" ? _jsx(User, { className: "w-3.5 h-3.5" }) : _jsx(Bot, { className: "w-3.5 h-3.5" }) }), _jsx("div", { className: cn("rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-fg rounded-tr-sm" : "bg-surface border border-border text-text rounded-tl-sm"), children: _jsx("p", { className: "whitespace-pre-wrap", children: m.content }) })] }, i))), loading && (_jsxs("div", { className: "flex gap-3 max-w-3xl", children: [_jsx("div", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-subtext", children: _jsx(Bot, { className: "w-3.5 h-3.5" }) }), _jsx("div", { className: "bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-2.5", children: _jsx("span", { className: "inline-flex gap-1", children: [0, 1, 2].map(i => _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-subtext animate-bounce", style: { animationDelay: `${i * 0.15}s` } }, i)) }) })] })), _jsx("div", { ref: bottomRef })] }), _jsx("div", { className: "px-6 py-4 border-t border-border", children: _jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5", children: [_jsx("input", { value: input, onChange: e => setInput(e.target.value), onKeyDown: e => e.key === "Enter" && !e.shiftKey && send(), placeholder: "Ask about exceptions, root causes, tickets\u2026", className: "flex-1 bg-transparent text-sm text-text placeholder:text-subtext focus:outline-none" }), _jsx("button", { onClick: send, disabled: !input.trim() || loading, className: "flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-fg hover:opacity-90 disabled:opacity-50 transition-opacity", children: _jsx(Send, { className: "w-3.5 h-3.5" }) })] }) })] }));
}
