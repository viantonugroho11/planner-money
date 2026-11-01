"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Category } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";

const EMOJI_LIST = ["🍔","🚌","🎬","📱","💊","🏠","👕","📚","✈️","🎮","💡","🛒","🐕","💰","🎁","🏋️"];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, removeCategory } = useFinanceStore();
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", icon: "📦", color: "#6b7280", type: "expense" as Category["type"] });

  function openNew() {
    setEditing({ id: uuid(), name: "", icon: "📦", color: "#6b7280", type: "expense" });
    setForm({ name: "", icon: "📦", color: "#6b7280", type: "expense" });
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type });
  }

  async function save() {
    if (!editing || !form.name.trim()) return;
    const cat: Category = { ...editing, ...form };
    if (categories.find((c) => c.id === editing.id)) await updateCategory(cat);
    else await addCategory(cat);
    setEditing(null);
  }

  const byType = {
    income: categories.filter((c) => c.type === "income"),
    expense: categories.filter((c) => c.type === "expense"),
    transfer: categories.filter((c) => c.type === "transfer"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openNew} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="font-semibold">{categories.find((c) => c.id === editing.id) ? "Edit" : "New"} Category</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="Category name" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Category["type"] }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Icon</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {EMOJI_LIST.map((e) => (
                <button key={e} onClick={() => setForm((f) => ({ ...f, icon: e }))}
                  className={`text-xl p-1 rounded ${form.icon === e ? "ring-2 ring-primary" : ""}`}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Color</label>
            <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
              className="mt-1 h-8 w-16 rounded border border-border" />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setEditing(null)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {(["income", "expense", "transfer"] as const).map((type) => (
        byType[type].length > 0 && (
          <div key={type} className="bg-card border border-border rounded-xl p-4">
            <h2 className="font-semibold capitalize mb-3">{type}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {byType[type].map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 group">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                  <button onClick={() => openEdit(cat)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </button>
                  <button onClick={() => removeCategory(cat.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}
