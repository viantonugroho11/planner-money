"use client";
import { useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function NetWorthPage() {
  const { wallets, initialized } = useFinanceStore();

  const totalAssets = useMemo(
    () => wallets.filter((w) => w.balance > 0).reduce((s, w) => s + w.balance, 0),
    [wallets]
  );
  const totalLiabilities = useMemo(
    () => wallets.filter((w) => w.balance < 0).reduce((s, w) => s + Math.abs(w.balance), 0),
    [wallets]
  );
  const netWorth = totalAssets - totalLiabilities;

  if (!initialized) return <div className="p-6 text-muted-foreground animate-pulse">Loading...</div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Net Worth</h1>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-income">{formatCurrency(totalAssets)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Liabilities</CardTitle></CardHeader>
          <CardContent>
            <p className="text-lg font-bold text-expense">{formatCurrency(totalLiabilities)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Net Worth</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-lg font-bold ${netWorth >= 0 ? "text-income" : "text-expense"}`}>
              {formatCurrency(netWorth)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Wallets</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {wallets.map((w) => (
            <div key={w.id} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{ backgroundColor: `${w.color}22` }}
              >
                {w.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{w.name}</p>
                <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: totalAssets > 0 ? `${(Math.max(w.balance, 0) / totalAssets) * 100}%` : "0%",
                      backgroundColor: w.color,
                    }}
                  />
                </div>
              </div>
              <p className={`text-sm font-semibold tabular-nums ${w.balance >= 0 ? "" : "text-expense"}`}>
                {formatCurrency(w.balance)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
