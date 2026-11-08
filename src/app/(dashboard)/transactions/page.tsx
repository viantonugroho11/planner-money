"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useState, useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate, generateId, startOfMonth, endOfMonth } from "@/lib/utils";
import { Plus, Search, Trash2, Filter } from "lucide-react";
import type { Transaction, TransactionType } from "@/lib/types";

const PERIOD_OPTIONS = [
  { label: "Bulan ini", value: "month" },
  { label: "3 bulan terakhir", value: "3m" },
  { label: "Semua waktu", value: "all" },
];

function TransactionForm({
  onSave,
  initial,
}: {
  onSave: (tx: Transaction) => void;
  initial?: Partial<Transaction>;
}) {
  const { categories, wallets } = useFinanceStore();
  const [type, setType] = useState<TransactionType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [walletId, setWalletId] = useState(initial?.walletId ?? wallets[0]?.id ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(
    initial?.date ? new Date(initial.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const filteredCats = categories.filter((c) => c.type === type);

  function handleSave() {
    if (!amount || !categoryId || !walletId) return;
    const tx: Transaction = {
      id: initial?.id ?? generateId(),
      type,
      amount: Math.round(parseFloat(amount.replace(/,/g, ""))),
      currency: "IDR",
      walletId,
      categoryId,
      note,
      date: new Date(date).getTime(),
      createdAt: initial?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    onSave(tx);
  }

  return (
    <div className="space-y-4">
      {/* Type tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-lg">
        {(["expense", "income", "transfer"] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategoryId(""); }}
            className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors capitalize ${
              type === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Amount (IDR)</label>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-bold"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {filteredCats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Wallet</label>
          <Select value={walletId} onValueChange={setWalletId}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.icon} {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Note</label>
          <Input placeholder="Optional note..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <Button className="w-full" onClick={handleSave} disabled={!amount || !categoryId}>
        Save Transaction
      </Button>
    </div>
  );
}

export default function TransactionsPage() {
  const { transactions, categories, wallets, addTransaction, removeTransaction, initialized } = useFinanceStore();
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("month");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const now = Date.now();
    let txs = transactions;

    if (period === "month") txs = txs.filter((t) => t.date >= startOfMonth() && t.date <= endOfMonth());
    else if (period === "3m") txs = txs.filter((t) => t.date >= now - 90 * 86400000);

    if (typeFilter !== "all") txs = txs.filter((t) => t.type === typeFilter);

    if (search) {
      const q = search.toLowerCase();
      txs = txs.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return cat?.name.toLowerCase().includes(q) || t.note?.toLowerCase().includes(q);
      });
    }

    return txs;
  }, [transactions, period, typeFilter, search, categories]);

  const totalFiltered = useMemo(() => {
    const income = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  if (!initialized) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transaksi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSave={(tx) => {
                addTransaction(tx);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Cari transaksi…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary bar */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span className="text-income font-medium">+{formatCurrency(totalFiltered.income)}</span>
        <span className="text-expense font-medium">-{formatCurrency(totalFiltered.expense)}</span>
        <span className={`font-medium ${totalFiltered.net >= 0 ? "text-income" : "text-expense"}`}>
          Selisih: {formatCurrency(Math.abs(totalFiltered.net))}
        </span>
        <span className="text-muted-foreground ml-auto">{filtered.length} transaksi</span>
      </div>

      {/* Transaction list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No transactions found
            </CardContent>
          </Card>
        )}
        {filtered.map((tx) => {
          const cat = categories.find((c) => c.id === tx.categoryId);
          const wallet = wallets.find((w) => w.id === tx.walletId);
          return (
            <Card key={tx.id}>
              <CardContent className="flex items-center gap-3 py-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: `${cat?.color ?? "#666"}22` }}
                >
                  {cat?.icon ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{cat?.name ?? tx.categoryId}</p>
                  <p className="text-xs text-muted-foreground">
                    {wallet?.name ?? tx.walletId} · {formatDate(tx.date)}
                  </p>
                  {tx.note && <p className="text-xs text-muted-foreground truncate">{tx.note}</p>}
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <div>
                    <p className={`text-sm font-semibold tabular-nums ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.type === "income" ? "income" : tx.type === "expense" ? "expense" : "secondary"} className="text-xs">
                      {tx.type}
                    </Badge>
                  </div>
                  <button
                    onClick={() => removeTransaction(tx.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
