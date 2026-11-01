"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Loan } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function calcMonthlyPayment(principal: number, annualRate: number, termMonths: number) {
  if (annualRate === 0) return principal / termMonths;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

export default function LoansPage() {
  const { loans, addLoan, removeLoan } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", principal: "", annualInterestRate: "", termMonths: "12" });

  async function save() {
    if (!form.name || !form.principal) return;
    const now = Date.now();
    const p = Number(form.principal);
    await addLoan({
      id: uuid(), name: form.name, principal: p, annualInterestRate: Number(form.annualInterestRate),
      termMonths: Number(form.termMonths), startDate: now, remainingPrincipal: p,
      currency: "IDR", createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm({ name: "", principal: "", annualInterestRate: "", termMonths: "12" });
  }

  const totalDebt = loans.reduce((s, l) => s + l.remainingPrincipal, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pinjaman / Kredit</h1>
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <p className="text-xs text-muted-foreground">Total Sisa Hutang</p>
        <p className="text-2xl font-bold text-red-500 mt-1">{fmt(totalDebt)}</p>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Tambah Pinjaman</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Nama Pinjaman</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. KPR BCA" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Pokok Pinjaman (IDR)</label>
              <input type="number" value={form.principal} onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Bunga per Tahun (%)</label>
              <input type="number" value={form.annualInterestRate} onChange={(e) => setForm((f) => ({ ...f, annualInterestRate: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tenor (bulan)</label>
              <input type="number" value={form.termMonths} onChange={(e) => setForm((f) => ({ ...f, termMonths: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            {form.principal && form.termMonths && (
              <div className="col-span-2 bg-secondary rounded-lg p-3 text-sm">
                Cicilan/bulan: <span className="font-semibold">{fmt(calcMonthlyPayment(Number(form.principal), Number(form.annualInterestRate || 0), Number(form.termMonths)))}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loans.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Tidak ada pinjaman tercatat.</div>
        ) : loans.map((loan) => {
          const monthly = calcMonthlyPayment(loan.principal, loan.annualInterestRate, loan.termMonths);
          const pct = loan.principal > 0 ? Math.max(0, 100 - (loan.remainingPrincipal / loan.principal) * 100) : 0;
          return (
            <div key={loan.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{loan.name}</p>
                  <p className="text-xs text-muted-foreground">{loan.annualInterestRate}% p.a. · {loan.termMonths} bulan</p>
                </div>
                <button onClick={() => removeLoan(loan.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs mb-3">
                <div><p className="text-muted-foreground">Pokok</p><p className="font-semibold">{fmt(loan.principal)}</p></div>
                <div><p className="text-muted-foreground">Sisa</p><p className="font-semibold text-red-500">{fmt(loan.remainingPrincipal)}</p></div>
                <div><p className="text-muted-foreground">Cicilan/bln</p><p className="font-semibold">{fmt(monthly)}</p></div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-right mt-1 text-muted-foreground">{pct.toFixed(1)}% lunas</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
