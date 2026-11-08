"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, generateId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Wallet, WalletType } from "@/lib/types";

const WALLET_TYPES: { value: WalletType; label: string; icon: string }[] = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "ewallet", label: "E-Wallet", icon: "📱" },
  { value: "investment", label: "Investment", icon: "📈" },
  { value: "other", label: "Other", icon: "💳" },
];

const COLORS = ["#4ade80", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#eab308", "#06b6d4", "#ef4444"];

function WalletForm({ onSave }: { onSave: (w: Wallet) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<WalletType>("bank");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState(COLORS[0]);

  const icon = WALLET_TYPES.find((t) => t.value === type)?.icon ?? "💳";

  function handleSave() {
    if (!name) return;
    onSave({
      id: generateId(),
      name,
      type,
      balance: parseFloat(balance) || 0,
      currency: "IDR",
      color,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Wallet Name</label>
        <Input placeholder="e.g. BCA, GoPay..." value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Type</label>
        <Select value={type} onValueChange={(v) => setType(v as WalletType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WALLET_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.icon} {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Initial Balance (IDR)</label>
        <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "white" : "transparent",
                transform: color === c ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
      <Button className="w-full" onClick={handleSave} disabled={!name}>
        Tambah dompet
      </Button>
    </div>
  );
}

export default function WalletsPage() {
  const { wallets, addWallet, removeWallet, transactions, initialized } = useFinanceStore();
  const [open, setOpen] = useState(false);

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  if (!initialized) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Dompet</h1>
          <p className="text-sm text-muted-foreground">Total: {formatCurrency(totalBalance)}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Tambah dompet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah dompet</DialogTitle>
            </DialogHeader>
            <WalletForm
              onSave={(w) => {
                addWallet(w);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {wallets.map((wallet) => {
          const walletTx = transactions.filter((t) => t.walletId === wallet.id);
          const income = walletTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
          const expense = walletTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          return (
            <Card key={wallet.id} className="relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-5"
                style={{ background: `radial-gradient(circle at top right, ${wallet.color}, transparent)` }}
              />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{wallet.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{wallet.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
                    </div>
                  </div>
                  {wallets.length > 1 && (
                    <button
                      onClick={() => removeWallet(wallet.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold" style={{ color: wallet.color }}>
                  {formatCurrency(wallet.balance)}
                </p>
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="text-income">+{formatCurrency(income)}</span>
                  <span className="text-expense">-{formatCurrency(expense)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
