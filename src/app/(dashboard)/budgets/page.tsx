"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useState, useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, generateId, startOfMonth, endOfMonth } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Budget } from "@/lib/types";

export default function BudgetsPage() {
  const { budgets, categories, transactions, addBudget, removeBudget, initialized } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [catId, setCatId] = useState("");
  const [amount, setAmount] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date >= startOfMonth() && t.date <= endOfMonth() && t.type === "expense"),
    [transactions]
  );

  const spendMap = useMemo(() => {
    const m = new Map<string, number>();
    monthTx.forEach((t) => m.set(t.categoryId, (m.get(t.categoryId) ?? 0) + t.amount));
    return m;
  }, [monthTx]);

  function handleSave() {
    if (!catId || !amount) return;
    const budget: Budget = {
      id: generateId(),
      categoryId: catId,
      amount: parseFloat(amount),
      currency: "IDR",
      period: "monthly",
      createdAt: Date.now(),
    };
    addBudget(budget);
    setOpen(false);
    setCatId("");
    setAmount("");
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendMap.get(b.categoryId) ?? 0), 0);

  if (!initialized) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Budgets</h1>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)} spent
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Add Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Monthly Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                <Select value={catId} onValueChange={setCatId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Monthly Budget (IDR)</label>
                <Input type="number" placeholder="500000" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!catId || !amount}>
                Save Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall progress */}
      {totalBudget > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Total Budget Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{formatCurrency(totalSpent)} spent</span>
              <span className={totalSpent > totalBudget ? "text-expense" : "text-muted-foreground"}>
                {Math.round((totalSpent / totalBudget) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
                  backgroundColor: totalSpent > totalBudget ? "#f87171" : "#4ade80",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {budgets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No budgets set. Add one to track your spending.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {budgets.map((budget) => {
          const cat = categories.find((c) => c.id === budget.categoryId);
          const spent = spendMap.get(budget.categoryId) ?? 0;
          const pct = Math.min((spent / budget.amount) * 100, 100);
          const over = spent > budget.amount;
          return (
            <Card key={budget.id}>
              <CardContent className="py-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{cat?.icon ?? "📦"}</span>
                    <span className="font-medium text-sm">{cat?.name ?? budget.categoryId}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${over ? "text-expense" : ""}`}>
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {formatCurrency(budget.amount)}</span>
                    <button onClick={() => removeBudget(budget.id)} className="text-muted-foreground hover:text-destructive ml-1">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: over ? "#f87171" : cat?.color ?? "#4ade80" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {over
                    ? `Over by ${formatCurrency(spent - budget.amount)}`
                    : `${formatCurrency(budget.amount - spent)} remaining`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
