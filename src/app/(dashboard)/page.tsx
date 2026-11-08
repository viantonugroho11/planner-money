"use client";
import { useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, startOfMonth, endOfMonth } from "@/lib/utils";
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell,
} from "recharts";
import { format, eachDayOfInterval, startOfMonth as dfnsSOM, endOfMonth as dfnsEOM } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function DashboardPage() {
  const { wallets, transactions, categories, initialized } = useFinanceStore();

  const now = Date.now();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd),
    [transactions, monthStart, monthEnd]
  );

  const totalBalance = useMemo(() => wallets.reduce((s, w) => s + w.balance, 0), [wallets]);
  const monthlyIncome = useMemo(() => monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTx]);
  const monthlyExpense = useMemo(() => monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTx]);
  const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;

  const cashflowData = useMemo(() => {
    const today = new Date();
    const days = eachDayOfInterval({ start: dfnsSOM(today), end: dfnsEOM(today) });
    return days.map((day) => {
      const label = format(day, "d", { locale: localeId });
      const dayStart = day.getTime();
      const dayEnd = dayStart + 86400000 - 1;
      const income = monthTx.filter((t) => t.type === "income" && t.date >= dayStart && t.date <= dayEnd).reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === "expense" && t.date >= dayStart && t.date <= dayEnd).reduce((s, t) => s + t.amount, 0);
      return { label, income, expense };
    });
  }, [monthTx]);

  const categoryData = useMemo(() => {
    const expenseTx = monthTx.filter((t) => t.type === "expense");
    const map = new Map<string, number>();
    expenseTx.forEach((t) => map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = categories.find((c) => c.id === catId);
        return { name: cat?.name ?? catId, amount, color: cat?.color ?? "#666", icon: cat?.icon ?? "📦" };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [monthTx, categories]);

  const recentTx = transactions.slice(0, 5);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground animate-pulse">Memuat data…</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "MMMM yyyy", { locale: localeId })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-4 w-4" /> Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">{wallets.length} wallet{wallets.length !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3 text-income" /> Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-income">{formatCurrency(monthlyIncome)}</p>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-3 w-3 text-expense" /> Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-expense">{formatCurrency(monthlyExpense)}</p>
            <p className="text-xs text-muted-foreground">savings {savingsRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Cashflow chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cashflow — this month</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={cashflowData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="income-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888" }} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: "8px", fontSize: 12 }}
                formatter={(v) => formatCurrency(Number(v))}
              />
              <Area type="monotone" dataKey="income" stroke="#4ade80" fill="url(#income-grad)" strokeWidth={2} dot={false} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f87171" fill="url(#expense-grad)" strokeWidth={2} dot={false} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Category breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryData.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
            )}
            {categoryData.map((cat) => {
              const pct = monthlyExpense > 0 ? (cat.amount / monthlyExpense) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-medium">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link href="/transactions" className="text-xs text-primary flex items-center gap-1 hover:underline">
                See all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentTx.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
            )}
            {recentTx.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ backgroundColor: `${cat?.color ?? "#666"}22` }}>
                    {cat?.icon ?? "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{cat?.name ?? tx.categoryId}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${tx.type === "income" ? "text-income" : "text-expense"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
