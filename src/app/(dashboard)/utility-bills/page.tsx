"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { UtilityBill } from "@/lib/types";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const CAT_ICONS: Record<string, string> = { electricity: "⚡", water: "💧", internet: "🌐", phone: "📱", gas: "🔥", other: "📄" };

export default function UtilityBillsPage() {
  const { utilityBills, addUtilityBill, removeUtilityBill, markUtilityPaid } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", dueDay: "1", category: "electricity" });

  async function save() {
    if (!form.name || !form.amount) return;
    const now = Date.now();
    await addUtilityBill({
      id: uuid(), name: form.name, amount: Number(form.amount),
      currency: "IDR", dueDay: Number(form.dueDay),
      category: form.category as UtilityBill["category"],
      isActive: true, createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ name: "", amount: "", dueDay: "1", category: "electricity" });
  }

  const today = new Date().getDate();
  const totalMonthly = utilityBills.filter((b) => b.isActive).reduce((s, b) => s + b.amount, 0);

  function isPaidThisMonth(bill: UtilityBill) {
    if (!bill.lastPaidAt) return false;
    const d = new Date(bill.lastPaidAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tagihan Bulanan</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs text-muted-foreground">Total Tagihan/Bulan</p>
        <p className="text-2xl font-bold mt-1">{fmt(totalMonthly)}</p>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Tambah Tagihan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nama</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. PLN" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Kategori</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                {Object.entries(CAT_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Jumlah (IDR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tanggal Jatuh Tempo</label>
              <input type="number" min="1" max="31" value={form.dueDay} onChange={(e) => setForm((f) => ({ ...f, dueDay: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 items-start">
        {utilityBills.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Belum ada tagihan.</div>
        ) : utilityBills.map((bill) => {
          const paid = isPaidThisMonth(bill);
          const overdue = !paid && today > bill.dueDay;
          return (
            <div key={bill.id} className={`bg-card border rounded-xl p-4 flex items-center gap-3 ${overdue ? "border-red-500/30" : "border-border"}`}>
              <span className="text-2xl">{CAT_ICONS[bill.category]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{bill.name}</p>
                <p className={`text-xs ${overdue ? "text-red-500" : "text-muted-foreground"}`}>
                  Jatuh tempo tgl {bill.dueDay}{overdue && !paid ? " · Terlambat!" : ""}
                </p>
              </div>
              <p className="font-semibold text-sm">{fmt(bill.amount)}</p>
              {paid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <button onClick={() => markUtilityPaid(bill.id)} title="Tandai sudah bayar">
                  <CheckCircle className="h-5 w-5 text-muted-foreground hover:text-green-500" />
                </button>
              )}
              <button onClick={() => removeUtilityBill(bill.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
