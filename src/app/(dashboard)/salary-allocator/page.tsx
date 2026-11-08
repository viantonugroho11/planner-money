"use client";
import { useState, useMemo } from "react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const PRESETS = [
  { name: "50/30/20", items: [{ label: "Kebutuhan", pct: 50 }, { label: "Keinginan", pct: 30 }, { label: "Tabungan", pct: 20 }] },
  { name: "40/30/20/10", items: [{ label: "Kebutuhan", pct: 40 }, { label: "Keinginan", pct: 30 }, { label: "Tabungan", pct: 20 }, { label: "Investasi", pct: 10 }] },
  { name: "Custom", items: [] },
];

const COLORS = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500"];

export default function SalaryAllocatorPage() {
  const [salary, setSalary] = useState("");
  const [preset, setPreset] = useState(0);
  const [items, setItems] = useState([
    { label: "Kebutuhan", pct: 50 },
    { label: "Keinginan", pct: 30 },
    { label: "Tabungan", pct: 20 },
  ]);

  function applyPreset(i: number) {
    setPreset(i);
    if (PRESETS[i].items.length > 0) setItems([...PRESETS[i].items]);
  }

  const totalPct = items.reduce((s, i) => s + i.pct, 0);
  const sal = Number(salary) || 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-xl font-semibold">Alokasi Gaji</h1>

      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <label className="text-xs text-muted-foreground">Gaji / Penghasilan (IDR)</label>
        <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder="Masukkan jumlah gaji" />
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={p.name} onClick={() => applyPreset(i)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${preset === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${COLORS[i % COLORS.length]}`} />
              <input value={item.label} onChange={(e) => setItems((prev) => prev.map((it, j) => j === i ? { ...it, label: e.target.value } : it))}
                className="flex-1 bg-transparent font-medium text-sm outline-none" />
              <div className="flex items-center gap-1">
                <input type="number" value={item.pct} onChange={(e) => setItems((prev) => prev.map((it, j) => j === i ? { ...it, pct: Number(e.target.value) } : it))}
                  className="w-14 px-2 py-1 bg-background border border-border rounded text-sm text-right" />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <button onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))} className="text-destructive text-xs">×</button>
            </div>
            {sal > 0 && (
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{fmt((sal * item.pct) / 100)}</span>
                  <span>{item.pct}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${COLORS[i % COLORS.length]}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
        <button onClick={() => setItems((prev) => [...prev, { label: "Kategori Baru", pct: 0 }])}
          className="w-full py-2 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          + Tambah Kategori
        </button>
      </div>

      <div className={`bg-card border rounded-xl p-4 ${totalPct === 100 ? "border-green-500/30" : "border-yellow-500/30"}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Alokasi</span>
          <span className={`font-bold ${totalPct === 100 ? "text-green-500" : "text-yellow-500"}`}>{totalPct}%</span>
        </div>
        {totalPct !== 100 && <p className="text-xs text-yellow-500 mt-1">Sisa {100 - totalPct}% belum dialokasikan</p>}
        {sal > 0 && totalPct === 100 && (
          <div className="mt-3 space-y-1">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{fmt((sal * item.pct) / 100)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
