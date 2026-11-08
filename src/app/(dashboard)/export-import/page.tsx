"use client";
import { useState, useRef } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export default function ExportImportPage() {
  const store = useFinanceStore();
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function exportData() {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      wallets: store.wallets,
      transactions: store.transactions,
      categories: store.categories,
      budgets: store.budgets,
      goals: store.goals,
      recurringTransactions: store.recurring,
      iouRecords: store.iouRecords,
      loans: store.loans,
      investments: store.investments,
      wishlistItems: store.wishlistItems,
      eventBudgets: store.eventBudgets,
      utilityBills: store.utilityBills,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.version || !data.wallets) throw new Error("Invalid backup file format.");

      // Import each entity — additive, no delete
      for (const w of data.wallets ?? []) store.addWallet(w);
      for (const c of data.categories ?? []) store.addCategory(c);
      for (const t of data.transactions ?? []) store.addTransaction(t);
      for (const b of data.budgets ?? []) store.addBudget(b);
      for (const g of data.goals ?? []) store.addGoal(g);
      for (const r of (data.recurringTransactions ?? data.recurring ?? [])) store.addRecurring(r);
      for (const i of data.iouRecords ?? []) store.addIouRecord(i);
      for (const l of data.loans ?? []) store.addLoan(l);
      for (const inv of data.investments ?? []) store.addInvestment(inv);
      for (const wi of data.wishlistItems ?? []) store.addWishlistItem(wi);
      for (const ev of data.eventBudgets ?? []) store.addEventBudget(ev);
      for (const ub of data.utilityBills ?? []) store.addUtilityBill(ub);

      setImportStatus("success");
      setImportMsg(`Imported from ${formatDate(new Date(data.exportedAt).getTime())}`);
    } catch (err: unknown) {
      setImportStatus("error");
      setImportMsg(err instanceof Error ? err.message : "Import failed.");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  const counts = [
    { label: "Wallets", n: store.wallets.length },
    { label: "Transactions", n: store.transactions.length },
    { label: "Categories", n: store.categories.length },
    { label: "Budgets", n: store.budgets.length },
    { label: "Goals", n: store.goals.length },
    { label: "Recurring", n: store.recurring.length },
    { label: "IOU Records", n: store.iouRecords.length },
    { label: "Loans", n: store.loans.length },
    { label: "Investments", n: store.investments.length },
    { label: "Wishlist", n: store.wishlistItems.length },
    { label: "Event Budgets", n: store.eventBudgets.length },
    { label: "Utility Bills", n: store.utilityBills.length },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold">Export &amp; Import</h1>

      {/* Data summary */}
      <Card>
        <CardHeader><CardTitle>Data Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {counts.map(({ label, n }) => (
              <div key={label} className="flex justify-between bg-secondary rounded-lg px-3 py-2">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{n}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-4 w-4" /> Export Backup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Download all your financial data as a JSON file. You can use this to restore data or transfer to another device.</p>
          <Button onClick={exportData} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" /> Download Backup
          </Button>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Import Backup</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Restore data from a previously exported JSON backup. Imported records are merged — existing data is not deleted.</p>

          {importStatus === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4" /> Import successful. {importMsg}
            </div>
          )}
          {importStatus === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4" /> {importMsg}
            </div>
          )}

          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="w-full sm:w-auto">
            <Upload className="h-4 w-4 mr-2" /> Choose Backup File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
