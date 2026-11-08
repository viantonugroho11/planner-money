"use client";
import { useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Sparkles, Play } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { CategorizationRule, CategorizationMatchType } from "@/lib/types";

const MATCH_LABELS: Record<CategorizationMatchType, string> = {
  contains: "Mengandung", startsWith: "Diawali", endsWith: "Diakhiri",
};

export default function CategorizationRulesPage() {
  const { categories, transactions, categorizationRules, addCategorizationRule, removeCategorizationRule, updateTransaction, initialized } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ keyword: "", categoryId: "", matchType: "contains" as CategorizationMatchType, priority: "10" });
  const [applyResult, setApplyResult] = useState<string | null>(null);

  async function addRule() {
    if (!form.keyword.trim() || !form.categoryId) return;
    const now = Date.now();
    const rule: CategorizationRule = {
      id: uuid(), keyword: form.keyword.trim(), categoryId: form.categoryId,
      matchType: form.matchType, priority: Number(form.priority) || 10,
      createdAt: now, updatedAt: now,
    };
    await addCategorizationRule(rule);
    setForm({ keyword: "", categoryId: "", matchType: "contains", priority: "10" });
    setShowAdd(false);
  }

  async function applyRules() {
    let count = 0;
    const sorted = [...categorizationRules].sort((a, b) => a.priority - b.priority);
    for (const tx of transactions) {
      const matched = sorted.find((rule) => {
        const kw = rule.keyword.toLowerCase();
        const note = (tx.note ?? "").toLowerCase();
        if (rule.matchType === "contains") return note.includes(kw);
        if (rule.matchType === "startsWith") return note.startsWith(kw);
        if (rule.matchType === "endsWith") return note.endsWith(kw);
        return false;
      });
      if (matched && tx.categoryId !== matched.categoryId) {
        await updateTransaction({ ...tx, categoryId: matched.categoryId, updatedAt: Date.now() });
        count++;
      }
    }
    setApplyResult(`${count} transaksi dikategorikan ulang.`);
    setTimeout(() => setApplyResult(null), 4000);
  }

  const expenseCategories = categories.filter((c) => c.type === "expense");

  if (!initialized) return <div className="flex items-center justify-center h-screen"><div className="text-muted-foreground animate-pulse">Memuat data…</div></div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Auto-Kategorisasi</h1>
          <p className="text-sm text-muted-foreground">Aturan otomatis berdasarkan kata kunci di catatan transaksi</p>
        </div>
        <div className="flex gap-2">
          {categorizationRules.length > 0 && (
            <Button variant="outline" size="sm" onClick={applyRules}>
              <Play className="h-4 w-4 mr-1" /> Terapkan
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Aturan
          </Button>
        </div>
      </div>

      {applyResult && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-2 text-sm">{applyResult}</div>
      )}

      {showAdd && (
        <Card>
          <CardHeader><CardTitle>Aturan Baru</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Kata Kunci *</label>
                <input value={form.keyword} onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                  placeholder="mis. grabfood, alfamart, tokopedia" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Jenis Pencocokan</label>
                <select value={form.matchType} onChange={(e) => setForm((f) => ({ ...f, matchType: e.target.value as CategorizationMatchType }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  {Object.entries(MATCH_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Kategori *</label>
                <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm">
                  <option value="">Pilih kategori...</option>
                  {expenseCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Prioritas (lebih kecil = lebih tinggi)</label>
                <input type="number" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  placeholder="10" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={addRule}>Simpan</Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Batal</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {categorizationRules.length === 0 && !showAdd && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Belum ada aturan auto-kategorisasi</p>
            <p className="text-xs text-muted-foreground mt-1">Tambah aturan untuk otomatis mengkategorikan transaksi berdasarkan kata kunci</p>
          </CardContent>
        </Card>
      )}

      {categorizationRules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> {categorizationRules.length} Aturan Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categorizationRules.map((rule) => {
              const cat = categories.find((c) => c.id === rule.categoryId);
              return (
                <div key={rule.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{rule.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="text-muted-foreground text-xs">{MATCH_LABELS[rule.matchType]}: </span>
                      <span className="font-mono bg-background px-1.5 py-0.5 rounded text-xs">{rule.keyword}</span>
                    </p>
                    {cat && <p className="text-xs text-muted-foreground mt-0.5">{cat.icon} {cat.name}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeCategorizationRule(rule.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
