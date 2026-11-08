"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Investment } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const TYPE_ICONS: Record<string, string> = { stock: "📈", crypto: "₿", mutual_fund: "🏦", gold: "🥇", property: "🏠", other: "💼" };

export default function InvestmentsPage() {
  const { investments, addInvestment, removeInvestment } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "stock", ticker: "", units: "", avgPrice: "", currentPrice: "" });

  async function save() {
    if (!form.name || !form.units || !form.avgPrice) return;
    const now = Date.now();
    await addInvestment({
      id: uuid(), name: form.name, type: form.type as Investment["type"],
      ticker: form.ticker, units: Number(form.units), avgPrice: Number(form.avgPrice),
      currentPrice: Number(form.currentPrice || form.avgPrice), currency: "IDR",
      createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ name: "", type: "stock", ticker: "", units: "", avgPrice: "", currentPrice: "" });
  }

  const totalValue = investments.reduce((s, i) => s + i.units * i.currentPrice, 0);
  const totalCost = investments.reduce((s, i) => s + i.units * i.avgPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Investasi</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Nilai</p>
          <p className="text-lg font-bold mt-1">{fmt(totalValue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Modal</p>
          <p className="text-lg font-bold mt-1">{fmt(totalCost)}</p>
        </div>
        <div className={`rounded-xl p-4 border ${totalPnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <p className="text-xs text-muted-foreground">P&L</p>
          <p className={`text-lg font-bold mt-1 ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>{fmtPct(totalPnlPct)}</p>
        </div>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Tambah Investasi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nama</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. BBCA" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipe</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                {Object.entries(TYPE_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Ticker (opsional)</label>
              <input value={form.ticker} onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Jumlah Unit/Lot</label>
              <input type="number" value={form.units} onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Harga Rata-rata (IDR)</label>
              <input type="number" value={form.avgPrice} onChange={(e) => setForm((f) => ({ ...f, avgPrice: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Harga Sekarang (IDR)</label>
              <input type="number" value={form.currentPrice} onChange={(e) => setForm((f) => ({ ...f, currentPrice: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {investments.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Belum ada investasi.</div>
        ) : investments.map((inv) => {
          const value = inv.units * inv.currentPrice;
          const cost = inv.units * inv.avgPrice;
          const pnl = value - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return (
            <div key={inv.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICONS[inv.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{inv.name}{inv.ticker ? ` (${inv.ticker})` : ""}</p>
                <p className="text-xs text-muted-foreground">{inv.units} unit · avg {fmt(inv.avgPrice)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{fmt(value)}</p>
                <p className={`text-xs ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{fmtPct(pnlPct)}</p>
              </div>
              <button onClick={() => removeInvestment(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
