"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Transaction } from "@/lib/types";
import { v4 as uuid } from "uuid";
import { ArrowRight, CheckCircle } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function TransferPage() {
  const { wallets, addTransaction } = useFinanceStore();
  const [form, setForm] = useState({ fromWalletId: "", toWalletId: "", amount: "", note: "" });
  const [done, setDone] = useState(false);

  const fromWallet = wallets.find((w) => w.id === form.fromWalletId);
  const toWallet = wallets.find((w) => w.id === form.toWalletId);

  async function submit() {
    if (!form.fromWalletId || !form.toWalletId || !form.amount || form.fromWalletId === form.toWalletId) return;
    const now = Date.now();
    const tx: Transaction = {
      id: uuid(), type: "transfer", amount: Number(form.amount), currency: "IDR",
      walletId: form.fromWalletId, toWalletId: form.toWalletId,
      categoryId: "transfer", note: form.note, date: now, createdAt: now, updatedAt: now,
    };
    await addTransaction(tx);
    setDone(true);
    setForm({ fromWalletId: "", toWalletId: "", amount: "", note: "" });
    setTimeout(() => setDone(false), 3000);
  }

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Transfer</h1>

      {done && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <p className="text-sm font-medium text-green-500">Transfer berhasil!</p>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground">Dari Dompet</label>
          <select value={form.fromWalletId} onChange={(e) => setForm((f) => ({ ...f, fromWalletId: e.target.value }))}
            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
            <option value="">Pilih dompet...</option>
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name} · {fmt(w.balance)}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Ke Dompet</label>
          <select value={form.toWalletId} onChange={(e) => setForm((f) => ({ ...f, toWalletId: e.target.value }))}
            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
            <option value="">Pilih dompet...</option>
            {wallets.filter((w) => w.id !== form.fromWalletId).map((w) => <option key={w.id} value={w.id}>{w.name} · {fmt(w.balance)}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Jumlah (IDR)</label>
          <input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="0" />
        </div>

        <div>
          <label className="text-xs text-muted-foreground">Catatan (opsional)</label>
          <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
        </div>

        {fromWallet && toWallet && form.amount && (
          <div className="bg-secondary rounded-lg p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">{fromWallet.name}</span><span className="font-medium text-red-500">-{fmt(Number(form.amount))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{toWallet.name}</span><span className="font-medium text-green-500">+{fmt(Number(form.amount))}</span></div>
          </div>
        )}

        <button onClick={submit} disabled={!form.fromWalletId || !form.toWalletId || !form.amount}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          Transfer
        </button>
      </div>
    </div>
  );
}
