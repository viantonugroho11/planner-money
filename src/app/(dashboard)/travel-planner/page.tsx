"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { TravelPlan, TravelItem, TravelItemCategory } from "@/lib/types";

const CAT_COLORS: Record<TravelItemCategory, string> = {
  transport: "#60a5fa", accommodation: "#a78bfa", food: "#4ade80",
  activities: "#fb923c", shopping: "#f472b6", other: "#94a3b8",
};

const CAT_LABELS: Record<TravelItemCategory, string> = {
  transport: "Transport", accommodation: "Penginapan", food: "Makan",
  activities: "Aktivitas", shopping: "Belanja", other: "Lainnya",
};

export default function TravelPlannerPage() {
  const { wallets, travelPlans, addTravelPlan, updateTravelPlan, removeTravelPlan, initialized } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", destination: "", startDate: "", endDate: "", totalBudget: "" });
  const [addingItem, setAddingItem] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ name: "", estimatedCost: "", actualCost: "", category: "transport" as TravelItemCategory });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggleExpand(id: string) {
    setExpanded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function addPlan() {
    if (!form.name.trim()) return;
    const now = Date.now();
    const plan: TravelPlan = {
      id: uuid(), name: form.name, destination: form.destination,
      startDate: form.startDate, endDate: form.endDate,
      totalBudget: Number(form.totalBudget) || 0, items: [],
      createdAt: now, updatedAt: now,
    };
    await addTravelPlan(plan);
    setExpanded((s) => new Set([...s, plan.id]));
    setForm({ name: "", destination: "", startDate: "", endDate: "", totalBudget: "" });
    setShowAdd(false);
  }

  async function addItem(plan: TravelPlan) {
    if (!itemForm.name.trim()) return;
    const item: TravelItem = {
      id: uuid(), name: itemForm.name,
      estimatedCost: Number(itemForm.estimatedCost) || 0,
      actualCost: Number(itemForm.actualCost) || 0,
      category: itemForm.category, paid: false,
    };
    await updateTravelPlan({ ...plan, items: [...plan.items, item], updatedAt: Date.now() });
    setItemForm({ name: "", estimatedCost: "", actualCost: "", category: "transport" });
    setAddingItem(null);
  }

  async function removeItem(plan: TravelPlan, itemId: string) {
    await updateTravelPlan({ ...plan, items: plan.items.filter((i) => i.id !== itemId), updatedAt: Date.now() });
  }

  async function togglePaid(plan: TravelPlan, itemId: string) {
    await updateTravelPlan({
      ...plan, updatedAt: Date.now(),
      items: plan.items.map((i) => i.id === itemId ? { ...i, paid: !i.paid } : i),
    });
  }

  const totalBalance = wallets.reduce((s, w) => s + w.balance, 0);

  if (!initialized) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Travel Planner</h1>
          <p className="text-sm text-muted-foreground">Saldo tersedia: {formatCurrency(totalBalance)}</p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Tambah Rencana
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Rencana Perjalanan Baru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Nama Rencana *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Liburan Bali 2025" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Destinasi</label>
                <input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  placeholder="Bali, Indonesia" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tanggal Berangkat</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Tanggal Pulang</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Total Anggaran (Rp)</label>
                <input type="number" value={form.totalBudget} onChange={(e) => setForm((f) => ({ ...f, totalBudget: e.target.value }))}
                  placeholder="5000000" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addPlan} size="sm">Simpan</Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {travelPlans.length === 0 && !showAdd && (
        <Card>
          <CardContent className="py-12 text-center">
            <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada rencana perjalanan</p>
          </CardContent>
        </Card>
      )}

      {travelPlans.map((plan) => {
        const totalEst = plan.items.reduce((s, i) => s + i.estimatedCost, 0);
        const totalAct = plan.items.reduce((s, i) => s + i.actualCost, 0);
        const paidAmt = plan.items.filter((i) => i.paid).reduce((s, i) => s + i.actualCost, 0);
        const budgetUsedPct = plan.totalBudget > 0 ? Math.min(100, (totalEst / plan.totalBudget) * 100) : 0;
        const isExpanded = expanded.has(plan.id);

        return (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" /> {plan.name}
                  </CardTitle>
                  {plan.destination && <p className="text-xs text-muted-foreground mt-0.5">{plan.destination}</p>}
                  {(plan.startDate || plan.endDate) && (
                    <p className="text-xs text-muted-foreground">{plan.startDate} – {plan.endDate}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(plan.id)}>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => removeTravelPlan(plan.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {plan.totalBudget > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Anggaran: {formatCurrency(plan.totalBudget)}</span>
                    <span>{budgetUsedPct.toFixed(0)}% terpakai</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${budgetUsedPct}%`, backgroundColor: budgetUsedPct > 90 ? "#ef4444" : "#22c55e" }} />
                  </div>
                </div>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Est. Total</p>
                    <p className="font-semibold mt-0.5">{formatCurrency(totalEst)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Actual Total</p>
                    <p className="font-semibold mt-0.5">{formatCurrency(totalAct)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-2 text-center">
                    <p className="text-muted-foreground">Sudah Bayar</p>
                    <p className="font-semibold mt-0.5 text-green-400">{formatCurrency(paidAmt)}</p>
                  </div>
                </div>

                {plan.items.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${item.paid ? "bg-secondary/50 opacity-60" : "bg-secondary"}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CAT_COLORS[item.category] }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.paid ? "line-through text-muted-foreground" : ""}`}>{item.name}</p>
                      <p className="text-xs text-muted-foreground">{CAT_LABELS[item.category]}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground line-through text-xs">{formatCurrency(item.estimatedCost)}</p>
                      <p className="font-medium">{formatCurrency(item.actualCost || item.estimatedCost)}</p>
                    </div>
                    <button onClick={() => togglePaid(plan, item.id)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${item.paid ? "bg-green-400/20 text-green-400" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}>
                      {item.paid ? "✓" : "Bayar"}
                    </button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(plan, item.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}

                {addingItem === plan.id ? (
                  <div className="bg-background border border-border rounded-lg p-3 space-y-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input value={itemForm.name} onChange={(e) => setItemForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Nama item (mis. Tiket pesawat)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                      <select value={itemForm.category} onChange={(e) => setItemForm((f) => ({ ...f, category: e.target.value as TravelItemCategory }))}
                        className="px-3 py-2 bg-background border border-border rounded-lg text-sm">
                        {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <input type="number" value={itemForm.estimatedCost} onChange={(e) => setItemForm((f) => ({ ...f, estimatedCost: e.target.value }))}
                        placeholder="Estimasi biaya" className="px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                      <input type="number" value={itemForm.actualCost} onChange={(e) => setItemForm((f) => ({ ...f, actualCost: e.target.value }))}
                        placeholder="Biaya aktual (opsional)" className="px-3 py-2 bg-background border border-border rounded-lg text-sm" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => addItem(plan)}>Tambah</Button>
                      <Button variant="outline" size="sm" onClick={() => setAddingItem(null)}>Batal</Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setAddingItem(plan.id)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Item
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
