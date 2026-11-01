"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/store/finance-store";
import { formatCurrency } from "@/lib/utils";

export default function SettingsPage() {
  const { wallets, transactions, categories, budgets, goals } = useFinanceStore();

  return (
    <div className="p-4 md:p-6 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Data Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Wallets</span><span>{wallets.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Transactions</span><span>{transactions.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Categories</span><span>{categories.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Budgets</span><span>{budgets.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Goals</span><span>{goals.length}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Finance AI Journal — Web</p>
          <p>Local-first personal finance management. All data stored in your browser via IndexedDB.</p>
          <p>No account required. No data leaves your device.</p>
        </CardContent>
      </Card>
    </div>
  );
}
