"use client";
import { useState, useRef, useEffect } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Send, Bot } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function buildContext(store: ReturnType<typeof useFinanceStore.getState>) {
  const { wallets, transactions, budgets, goals } = store;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTx = transactions.filter((t) => t.date >= monthStart);
  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  return `Data keuangan pengguna:
- Total saldo semua dompet: ${fmt(totalBalance)}
- Pemasukan bulan ini: ${fmt(income)}
- Pengeluaran bulan ini: ${fmt(expense)}
- Tabungan bersih bulan ini: ${fmt(income - expense)}
- Jumlah dompet: ${wallets.length}
- Jumlah tujuan keuangan aktif: ${goals.length}
- Jumlah anggaran aktif: ${budgets.length}`;
}

export default function AiCoachPage() {
  const store = useFinanceStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Halo! Saya AI Coach keuangan Anda. Tanyakan apa saja tentang kondisi keuangan, tips menabung, atau strategi investasi. Saya akan bantu berdasarkan data keuangan Anda." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const context = buildContext(store);
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg], context }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "Maaf, terjadi kesalahan." }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Maaf, tidak bisa terhubung ke AI. Coba lagi nanti." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">AI Coach Keuangan</h1>
          <p className="text-xs text-muted-foreground">Powered by AI · Data real-time dari akun Anda</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 bg-card border border-border rounded-xl p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl px-4 py-2 text-sm text-muted-foreground">
              <span className="animate-pulse">Sedang berpikir...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Tanyakan sesuatu..." disabled={loading}
          className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-sm disabled:opacity-50" />
        <button onClick={send} disabled={!input.trim() || loading}
          className="bg-primary text-primary-foreground p-2 rounded-xl disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
