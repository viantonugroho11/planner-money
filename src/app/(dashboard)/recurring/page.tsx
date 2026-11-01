"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { RecurringTransaction } from "@/lib/types";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function RecurringPage() {
  const { recurring, categories, wallets, addRecurring, updateRecurring, removeRecurring } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", type: "expense", categoryId: "", walletId: "", frequency: "monthly" });

  async function save() {
    if (!form.description || !form.amount || !form.categoryId || !form.walletId) return;
    const now = Date.now();
    await addRecurring({
      id: uuid(), description: form.description, amount: Number(form.amount),
      type: form.type as RecurringTransaction["type"], categoryId: form.categoryId,
      walletId: form.walletId, frequency: form.frequency as RecurringTransaction["frequency"],
      nextOccurrence: now, isActive: true, createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ description: "", amount: "", type: "expense", categoryId: "", walletId: "", frequency: "monthly" });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Recurring Transactions</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">New Recurring</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Description</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. Netflix" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Amount (IDR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Category</label>
              <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="">Select...</option>
                {categories.filter((c) => c.type === form.type).map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Wallet</label>
              <select value={form.walletId} onChange={(e) => setForm((f) => ({ ...f, walletId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="">Select...</option>
                {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {recurring.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">No recurring transactions yet.</div>
        ) : recurring.map((r) => {
          const cat = categories.find((c) => c.id === r.categoryId);
          const wallet = wallets.find((w) => w.id === r.walletId);
          return (
            <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{cat?.icon ?? "🔄"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{r.description}</p>
                <p className="text-xs text-muted-foreground">{r.frequency} · {wallet?.name}</p>
              </div>
              <p className={`font-semibold text-sm ${r.type === "income" ? "text-green-500" : "text-red-500"}`}>
                {r.type === "income" ? "+" : "-"}{fmt(r.amount)}
              </p>
              <button onClick={() => updateRecurring({ ...r, isActive: !r.isActive, updatedAt: Date.now() })}>
                {r.isActive ? <ToggleRight className="h-5 w-5 text-primary" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
              </button>
              <button onClick={() => removeRecurring(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
