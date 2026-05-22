// src/pages/Chatbot/ChatbotPage.tsx
import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/services/api/endpoints";
import { MessagesSquare, Send, Bot, User } from "lucide-react";
import { cn } from "@/utils/cn";

interface Msg { role: "user"|"assistant"; content: string; }

export function ChatbotPage() {
  const [msgs, setMsgs]       = useState<Msg[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [session]             = useState(() => Math.random().toString(36).slice(2));
  const bottomRef             = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMsgs(m => [...m, { role:"user", content:text }]);
    setLoading(true);
    try {
      const r = await chatApi.send(text, session);
      setMsgs(m => [...m, { role:"assistant", content:r.reply }]);
    } catch {
      setMsgs(m => [...m, { role:"assistant", content:"Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-3.5rem)]">
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-lg font-semibold text-text flex items-center gap-2"><MessagesSquare className="w-5 h-5" /> APEA Assistant</h1>
        <p className="text-sm text-subtext">Ask about exceptions, tickets, SOPs, and production data</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <Bot className="w-10 h-10 text-subtext" />
            <p className="text-sm text-subtext">Ask me anything about production exceptions, tickets, or SOPs.</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex gap-3 max-w-3xl", m.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs", m.role === "user" ? "bg-primary text-primary-fg" : "bg-muted text-subtext")}>
              {m.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={cn("rounded-2xl px-4 py-2.5 text-sm", m.role === "user" ? "bg-primary text-primary-fg rounded-tr-sm" : "bg-surface border border-border text-text rounded-tl-sm")}>
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-subtext"><Bot className="w-3.5 h-3.5" /></div>
            <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-2.5">
              <span className="inline-flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-subtext animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-border">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5">
          <input
            value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ask about exceptions, root causes, tickets…"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-subtext focus:outline-none"
          />
          <button onClick={send} disabled={!input.trim()||loading} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-fg hover:opacity-90 disabled:opacity-50 transition-opacity">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
