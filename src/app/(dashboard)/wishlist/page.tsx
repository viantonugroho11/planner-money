"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { WishlistItem } from "@/lib/types";
import { Plus, Trash2, Pencil } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function WishlistPage() {
  const { wishlistItems, addWishlistItem, updateWishlistItem, removeWishlistItem } = useFinanceStore();
  const [editing, setEditing] = useState<WishlistItem | null>(null);
  const [form, setForm] = useState({ name: "", targetPrice: "", savedAmount: "", priority: "medium", notes: "" });

  function openNew() {
    const blank: WishlistItem = { id: uuid(), name: "", targetPrice: 0, savedAmount: 0, currency: "IDR", priority: "medium", createdAt: Date.now(), updatedAt: Date.now() };
    setEditing(blank);
    setForm({ name: "", targetPrice: "", savedAmount: "0", priority: "medium", notes: "" });
  }

  async function save() {
    if (!editing || !form.name || !form.targetPrice) return;
    const now = Date.now();
    const item: WishlistItem = { ...editing, name: form.name, targetPrice: Number(form.targetPrice), savedAmount: Number(form.savedAmount), priority: form.priority as WishlistItem["priority"], notes: form.notes, updatedAt: now };
    if (wishlistItems.find((w) => w.id === editing.id)) await updateWishlistItem(item);
    else await addWishlistItem(item);
    setEditing(null);
  }

  const priorityColor = { high: "text-red-500", medium: "text-yellow-500", low: "text-green-500" };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Wishlist</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">{wishlistItems.find((w) => w.id === editing.id) ? "Edit" : "New"} Item</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Item Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Target Price (IDR)</label>
              <input type="number" value={form.targetPrice} onChange={(e) => setForm((f) => ({ ...f, targetPrice: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Saved So Far (IDR)</label>
              <input type="number" value={form.savedAmount} onChange={(e) => setForm((f) => ({ ...f, savedAmount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Notes</label>
              <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setEditing(null)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 items-start">
        {wishlistItems.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Belum ada item wishlist.</div>
        ) : wishlistItems.map((item) => {
          const pct = item.targetPrice > 0 ? Math.min(100, (item.savedAmount / item.targetPrice) * 100) : 0;
          return (
            <div key={item.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className={`text-xs font-medium ${priorityColor[item.priority]}`}>{item.priority} priority</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(item); setForm({ name: item.name, targetPrice: String(item.targetPrice), savedAmount: String(item.savedAmount), priority: item.priority, notes: item.notes ?? "" }); }}>
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button onClick={() => removeWishlistItem(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{fmt(item.savedAmount)} saved</span>
                <span>{fmt(item.targetPrice)} target</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">{pct.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
