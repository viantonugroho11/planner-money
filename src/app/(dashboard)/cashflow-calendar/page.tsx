"use client";
import { useState, useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatCompact } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function CashflowCalendarPage() {
  const { transactions, categories } = useFinanceStore();
  const [current, setCurrent] = useState(new Date());

  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = getDaysInMonth(current);
  const firstDayOfWeek = getDay(startOfMonth(current)); // 0=Sun

  const dayData = useMemo(() => {
    const map = new Map<number, { income: number; expense: number; txCount: number }>();
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const day = d.getDate();
      const prev = map.get(day) ?? { income: 0, expense: 0, txCount: 0 };
      map.set(day, {
        income: prev.income + (tx.type === "income" ? tx.amount : 0),
        expense: prev.expense + (tx.type === "expense" ? tx.amount : 0),
        txCount: prev.txCount + 1,
      });
    }
    return map;
  }, [transactions, year, month]);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedTx = useMemo(() => {
    if (!selectedDay) return [];
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
    }).sort((a, b) => b.date - a.date);
  }, [selectedDay, transactions, year, month]);

  const monthIncome = Array.from(dayData.values()).reduce((s, v) => s + v.income, 0);
  const monthExpense = Array.from(dayData.values()).reduce((s, v) => s + v.expense, 0);

  const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  function prevMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)); setSelectedDay(null); }
  function nextMonth() { setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)); setSelectedDay(null); }

  const today = new Date();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Kalender Cashflow</h1>

      {/* Header */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-secondary"><ChevronLeft className="h-5 w-5" /></button>
            <div className="text-center">
              <p className="font-semibold">{format(current, "MMMM yyyy", { locale: localeId })}</p>
              <div className="flex gap-4 text-xs mt-1">
                <span className="text-green-400">+{formatCurrency(monthIncome)}</span>
                <span className="text-red-400">-{formatCurrency(monthExpense)}</span>
                <span className={monthIncome - monthExpense >= 0 ? "text-blue-400" : "text-orange-400"}>
                  Net: {formatCurrency(monthIncome - monthExpense)}
                </span>
              </div>
            </div>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-secondary"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const data = dayData.get(day);
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`relative rounded-lg p-1 text-xs text-center transition-colors min-h-[52px] flex flex-col items-center gap-0.5 ${
                    isSelected ? "bg-primary/20 ring-1 ring-primary" : isToday ? "bg-secondary ring-1 ring-primary/40" : "hover:bg-secondary"
                  }`}
                >
                  <span className={`font-medium ${isToday ? "text-primary" : ""}`}>{day}</span>
                  {data && (
                    <>
                      {data.income > 0 && <span className="text-green-400 leading-none" style={{ fontSize: "9px" }}>+{formatCompact(data.income)}</span>}
                      {data.expense > 0 && <span className="text-red-400 leading-none" style={{ fontSize: "9px" }}>-{formatCompact(data.expense)}</span>}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(new Date(year, month, selectedDay), "EEEE, d MMMM yyyy", { locale: localeId })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedTx.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Tidak ada transaksi</p>
            )}
            {selectedTx.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              return (
                <div key={tx.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: `${cat?.color ?? "#666"}22` }}>
                    {cat?.icon ?? "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.note || cat?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{cat?.name}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
