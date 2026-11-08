"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { IouRecord } from "@/lib/types";
import { Plus, Trash2, CheckCircle } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function IouPage() {
  const { iouRecords, addIouRecord, updateIouRecord, removeIouRecord } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ personName: "", amount: "", direction: "lent", description: "" });

  async function save() {
    if (!form.personName || !form.amount) return;
    const now = Date.now();
    const amt = Number(form.amount);
    await addIouRecord({
      id: uuid(), personName: form.personName, direction: form.direction as IouRecord["direction"],
      totalAmount: amt, remainingAmount: amt, description: form.description,
      status: "active", createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ personName: "", amount: "", direction: "lent", description: "" });
  }

  const active = iouRecords.filter((r) => r.status === "active");
  const settled = iouRecords.filter((r) => r.status !== "active");
  const totalLent = active.filter((r) => r.direction === "lent").reduce((s, r) => s + r.remainingAmount, 0);
  const totalBorrowed = active.filter((r) => r.direction === "borrowed").reduce((s, r) => s + r.remainingAmount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hutang / Piutang</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Piutang (orang hutang ke saya)</p>
          <p className="text-xl font-bold text-green-500 mt-1">{fmt(totalLent)}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Hutang (saya hutang ke orang)</p>
          <p className="text-xl font-bold text-red-500 mt-1">{fmt(totalBorrowed)}</p>
        </div>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Tambah Catatan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Nama</label>
              <input value={form.personName} onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="Nama orang" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Jumlah (IDR)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipe</label>
              <select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                <option value="lent">Saya meminjamkan (piutang)</option>
                <option value="borrowed">Saya meminjam (hutang)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Keterangan</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="Optional" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {active.length === 0 && <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Tidak ada catatan aktif.</div>}
        {active.map((r) => (
          <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${r.direction === "lent" ? "bg-green-500" : "bg-red-500"}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{r.personName}</p>
              <p className="text-xs text-muted-foreground">{r.direction === "lent" ? "Meminjamkan" : "Meminjam"}{r.description ? ` · ${r.description}` : ""}</p>
            </div>
            <p className={`font-semibold text-sm ${r.direction === "lent" ? "text-green-500" : "text-red-500"}`}>{fmt(r.remainingAmount)}</p>
            <button onClick={() => updateIouRecord({ ...r, status: "settled", updatedAt: Date.now() })} title="Lunas">
              <CheckCircle className="h-4 w-4 text-muted-foreground hover:text-green-500" />
            </button>
            <button onClick={() => removeIouRecord(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
          </div>
        ))}
        {settled.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-muted-foreground cursor-pointer">Settled ({settled.length})</summary>
            <div className="space-y-2 mt-2">
              {settled.map((r) => (
                <div key={r.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <div className="flex-1"><p className="font-medium text-sm line-through">{r.personName}</p></div>
                  <p className="text-sm text-muted-foreground">{fmt(r.totalAmount)}</p>
                  <button onClick={() => removeIouRecord(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
