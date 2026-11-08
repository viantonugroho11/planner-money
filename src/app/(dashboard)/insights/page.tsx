"use client";
import { useFinanceStore } from "@/store/finance-store";
import { useMemo } from "react";

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function InsightsPage() {
  const { transactions, categories } = useFinanceStore();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const monthTx = transactions.filter((t) => t.date >= monthStart);

  const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTx.filter((t) => t.type === "expense").forEach((t) => {
      map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .map(([id, amount]) => ({ id, amount, cat: categories.find((c) => c.id === id) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [monthTx, categories]);

  const daily = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    monthTx.forEach((t) => {
      const d = new Date(t.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
      if (!map[d]) map[d] = { income: 0, expense: 0 };
      if (t.type === "income") map[d].income += t.amount;
      if (t.type === "expense") map[d].expense += t.amount;
    });
    return Object.entries(map).slice(-14);
  }, [monthTx]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Insights</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Income", value: fmt(income), color: "text-green-500" },
          { label: "Expense", value: fmt(expense), color: "text-red-500" },
          { label: "Savings", value: fmt(savings), color: savings >= 0 ? "text-blue-500" : "text-red-500" },
          { label: "Savings Rate", value: `${savingsRate.toFixed(1)}%`, color: "text-purple-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="font-semibold mb-4">Top Expense Categories</h2>
        {byCategory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No expenses this month.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(({ id, amount, cat }) => (
              <div key={id} className="flex items-center gap-3">
                <span className="text-xl">{cat?.icon ?? "📦"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{cat?.name ?? id}</span>
                    <span>{fmt(amount)}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (amount / (byCategory[0]?.amount ?? 1)) * 100)}%`,
                        backgroundColor: cat?.color ?? "#6b7280",
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="font-semibold mb-4">Daily Cashflow (last 14 days)</h2>
        {daily.length === 0 ? (
          <p className="text-muted-foreground text-sm">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {daily.map(([date, { income: inc, expense: exp }]) => (
              <div key={date} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-muted-foreground text-xs">{date}</span>
                <div className="flex-1 flex gap-1">
                  {inc > 0 && (
                    <div className="h-4 rounded bg-green-500/70 text-white text-[10px] flex items-center px-1"
                      style={{ width: `${Math.min(60, (inc / 5_000_000) * 100)}%`, minWidth: 30 }}>
                      +{fmt(inc)}
                    </div>
                  )}
                  {exp > 0 && (
                    <div className="h-4 rounded bg-red-500/70 text-white text-[10px] flex items-center px-1"
                      style={{ width: `${Math.min(60, (exp / 5_000_000) * 100)}%`, minWidth: 30 }}>
                      -{fmt(exp)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
