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
  const maxDaily = Math.max(1, ...daily.flatMap(([, v]) => [v.income, v.expense]));

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Insights</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pemasukan", value: fmt(income), color: "text-green-500" },
          { label: "Pengeluaran", value: fmt(expense), color: "text-red-500" },
          { label: "Tabungan", value: fmt(savings), color: savings >= 0 ? "text-blue-500" : "text-red-500" },
          { label: "Rasio tabungan", value: `${savingsRate.toFixed(1)}%`, color: "text-purple-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card rounded-xl p-4 border border-border">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <h2 className="font-semibold mb-4">Kategori pengeluaran terbesar</h2>
        {byCategory.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada pengeluaran bulan ini.</p>
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
        <h2 className="font-semibold mb-4">Arus kas harian bulan ini</h2>
        {daily.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada transaksi.</p>
        ) : (
          <div className="divide-y divide-border">
            {daily.map(([date, { income: inc, expense: exp }]) => (
              <div key={date} className="grid grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[4.5rem_1fr_11rem] items-center gap-3 py-2">
                <span className="text-xs text-muted-foreground">{date}</span>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-green-500" style={{ width: `${(inc / maxDaily) * 100}%` }} />
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-red-500" style={{ width: `${(exp / maxDaily) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right text-xs tabular-nums leading-snug">
                  <p className={inc > 0 ? "text-green-500" : "text-muted-foreground/50"}>{inc > 0 ? `+${fmt(inc)}` : "—"}</p>
                  <p className={exp > 0 ? "text-red-500" : "text-muted-foreground/50"}>{exp > 0 ? `-${fmt(exp)}` : "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
