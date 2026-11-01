"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { EventBudget, EventBudgetItem } from "@/lib/types";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function EventBudgetPage() {
  const { eventBudgets, addEventBudget, updateEventBudget, removeEventBudget } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", date: "", totalBudget: "" });
  const [items, setItems] = useState<EventBudgetItem[]>([]);
  const [itemForm, setItemForm] = useState({ name: "", budget: "", spent: "" });

  async function save() {
    if (!form.name || !form.totalBudget) return;
    const now = Date.now();
    await addEventBudget({
      id: uuid(), name: form.name, date: form.date ? new Date(form.date).getTime() : now,
      totalBudget: Number(form.totalBudget), currency: "IDR", items,
      createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ name: "", date: "", totalBudget: "" });
    setItems([]);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Event / Acara</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">Event Baru</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Nama Event</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. Pernikahan, Ulang Tahun" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tanggal</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Total Budget (IDR)</label>
              <input type="number" value={form.totalBudget} onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div className="border border-border rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Item Anggaran</p>
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{item.name}</span>
                <span className="text-muted-foreground">{fmt(item.budget)}</span>
                <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3 text-destructive" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Item name" className="flex-1 px-2 py-1 bg-background border border-border rounded text-xs" />
              <input type="number" value={itemForm.budget} onChange={(e) => setItemForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="Budget" className="w-28 px-2 py-1 bg-background border border-border rounded text-xs" />
              <button onClick={() => {
                if (!itemForm.name || !itemForm.budget) return;
                setItems((prev) => [...prev, { name: itemForm.name, budget: Number(itemForm.budget), spent: 0 }]);
                setItemForm({ name: "", budget: "", spent: "" });
              }} className="bg-secondary px-2 py-1 rounded text-xs">Add</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {eventBudgets.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Belum ada event.</div>
        ) : eventBudgets.map((ev) => {
          const totalSpent = ev.items.reduce((s, i) => s + i.spent, 0);
          const pct = ev.totalBudget > 0 ? Math.min(100, (totalSpent / ev.totalBudget) * 100) : 0;
          const isExpanded = expanded === ev.id;
          return (
            <div key={ev.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{ev.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.date).toLocaleDateString("id-ID")}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setExpanded(isExpanded ? null : ev.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                    <button onClick={() => removeEventBudget(ev.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Terpakai: {fmt(totalSpent)}</span>
                  <span>Budget: {fmt(ev.totalBudget)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              {isExpanded && ev.items.length > 0 && (
                <div className="border-t border-border px-4 pb-4 pt-2 space-y-1">
                  {ev.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex-1">{item.name}</span>
                      <span className="text-muted-foreground">{fmt(item.spent)} / {fmt(item.budget)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
