"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, generateId, formatDate } from "@/lib/utils";
import { Plus, Trash2, Target } from "lucide-react";
import type { Goal } from "@/lib/types";

const GOAL_ICONS = ["🏠", "🚗", "✈️", "💍", "📱", "💻", "🎓", "🏖️", "💰", "🏋️", "🎮", "📷"];
const COLORS = ["#4ade80", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#eab308", "#06b6d4"];

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal, initialized } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [contribute, setContribute] = useState<{ goalId: string; amount: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    target: "",
    current: "0",
    deadline: "",
    icon: "🏠",
    color: COLORS[0],
  });

  function handleSave() {
    if (!form.name || !form.target) return;
    const goal: Goal = {
      id: generateId(),
      name: form.name,
      targetAmount: parseFloat(form.target),
      currentAmount: parseFloat(form.current) || 0,
      currency: "IDR",
      deadline: form.deadline ? new Date(form.deadline).getTime() : undefined,
      icon: form.icon,
      color: form.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addGoal(goal);
    setOpen(false);
    setForm({ name: "", target: "", current: "0", deadline: "", icon: "🏠", color: COLORS[0] });
  }

  function handleContribute() {
    if (!contribute) return;
    const goal = goals.find((g) => g.id === contribute.goalId);
    if (!goal) return;
    updateGoal({
      ...goal,
      currentAmount: goal.currentAmount + parseFloat(contribute.amount || "0"),
      updatedAt: Date.now(),
    });
    setContribute(null);
  }

  if (!initialized) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tujuan</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4" /> Tambah tujuan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Goal Name</label>
                <Input placeholder="e.g. Emergency Fund" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Target (IDR)</label>
                  <Input type="number" placeholder="10000000" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Current (IDR)</label>
                  <Input type="number" placeholder="0" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Deadline (optional)</label>
                <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {GOAL_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setForm({ ...form, icon: ic })}
                      className={`text-xl p-1 rounded-lg border-2 transition-all ${form.icon === ic ? "border-primary" : "border-transparent"}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!form.name || !form.target}>
                Save Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Belum ada tujuan. Tambahkan satu untuk mulai menabung.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const remaining = goal.targetAmount - goal.currentAmount;
          const done = pct >= 100;
          return (
            <Card key={goal.id} className="relative overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: `radial-gradient(circle at top right, ${goal.color}, transparent)` }} />
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="font-semibold">{goal.name}</p>
                      {goal.deadline && (
                        <p className="text-xs text-muted-foreground">by {formatDate(goal.deadline)}</p>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium" style={{ color: goal.color }}>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: done ? "#4ade80" : goal.color }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{Math.round(pct)}%</span>
                    {!done && <span>{formatCurrency(remaining)} to go</span>}
                    {done && <span className="text-income font-medium">Goal reached! 🎉</span>}
                  </div>
                </div>

                {!done && (
                  <Dialog
                    open={contribute?.goalId === goal.id}
                    onOpenChange={(v) => !v && setContribute(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setContribute({ goalId: goal.id, amount: "" })}
                      >
                        + Add Savings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contribute to {goal.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="number"
                          placeholder="Amount (IDR)"
                          value={contribute?.amount ?? ""}
                          onChange={(e) => setContribute((c) => c ? { ...c, amount: e.target.value } : null)}
                        />
                        <Button className="w-full" onClick={handleContribute}>
                          Add
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
