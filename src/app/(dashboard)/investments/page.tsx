"use client";
import { useEffect, useRef, useState } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Investment } from "@/lib/types";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { v4 as uuid } from "uuid";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const TYPE_ICONS: Record<string, string> = { stock: "📈", crypto: "₿", mutual_fund: "🏦", gold: "🥇", property: "🏠", other: "💼" };

const TYPE_LABELS: Record<string, string> = { stock: "Saham", crypto: "Kripto", mutual_fund: "Reksa dana", gold: "Emas", property: "Properti", other: "Lainnya / privat" };

type Suggestion = { symbol: string; ticker: string; name: string };

async function fetchMarketPrice(params: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/market?${params}`);
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.price === "number" ? json.price : null;
  } catch {
    return null;
  }
}

const emptyForm = { name: "", type: "stock", ticker: "", units: "", avgPrice: "", currentPrice: "" };

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, removeInvestment, initialized } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceNote, setPriceNote] = useState("");
  const refreshed = useRef(false);

  const isStock = form.type === "stock";
  const isGold = form.type === "gold";
  const auto = isStock || isGold;

  // Refresh market prices of existing stock/gold holdings once per visit
  useEffect(() => {
    if (!initialized || refreshed.current || investments.length === 0) return;
    refreshed.current = true;
    (async () => {
      for (const inv of investments) {
        let price: number | null = null;
        if (inv.type === "stock" && inv.ticker) price = await fetchMarketPrice(`symbol=${encodeURIComponent(inv.ticker + ".JK")}`);
        else if (inv.type === "gold") price = await fetchMarketPrice("gold=1");
        if (price != null && price !== inv.currentPrice) await updateInvestment({ ...inv, currentPrice: price, updatedAt: Date.now() });
      }
    })();
  }, [initialized, investments, updateInvestment]);

  // Stock name autocomplete (IDX)
  useEffect(() => {
    if (!open || !isStock || form.ticker || form.name.trim().length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/market?search=${encodeURIComponent(form.name.trim())}`);
        const json = await res.json();
        setSuggestions(json.results ?? []);
      } catch { setSuggestions([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [form.name, form.ticker, isStock, open]);

  async function pickSuggestion(sg: Suggestion) {
    setSuggestions([]);
    setForm((f) => ({ ...f, name: sg.name, ticker: sg.ticker }));
    setPriceLoading(true); setPriceNote("");
    const price = await fetchMarketPrice(`symbol=${encodeURIComponent(sg.symbol)}`);
    setPriceLoading(false);
    if (price == null) { setPriceNote("Harga pasar belum bisa diambil. Isi manual."); return; }
    setForm((f) => ({ ...f, avgPrice: String(price), currentPrice: String(price) }));
    setPriceNote("Harga terisi otomatis dari pasar. Ubah harga rata-rata jika modalmu berbeda.");
  }

  async function changeType(type: string) {
    setSuggestions([]); setPriceNote("");
    setForm({ ...emptyForm, type });
    if (type === "gold") {
      setPriceLoading(true);
      const price = await fetchMarketPrice("gold=1");
      setPriceLoading(false);
      setForm((f) => f.type !== "gold" ? f : { ...f, name: "Emas", ticker: "XAU", ...(price != null ? { avgPrice: String(price), currentPrice: String(price) } : {}) });
      setPriceNote(price != null ? "Harga emas per gram (IDR) terisi otomatis. Ubah harga rata-rata jika modalmu berbeda." : "Harga emas belum bisa diambil. Isi manual.");
    }
  }

  async function save() {
    if (!form.name || !form.units || !form.avgPrice) return;
    const now = Date.now();
    await addInvestment({
      id: uuid(), name: form.name, type: form.type as Investment["type"],
      ticker: form.ticker, units: Number(form.units), avgPrice: Number(form.avgPrice),
      currentPrice: Number(form.currentPrice || form.avgPrice), currency: "IDR",
      createdAt: now, updatedAt: now,
    });
    setOpen(false);
    setForm(emptyForm); setPriceNote(""); setSuggestions([]);
  }

  const totalValue = investments.reduce((s, i) => s + i.units * i.currentPrice, 0);
  const totalCost = investments.reduce((s, i) => s + i.units * i.avgPrice, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Investasi</h1>
        <button onClick={() => { setOpen(true); setForm(emptyForm); setPriceNote(""); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="h-4 w-4" /> Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Nilai</p>
          <p className="text-lg font-bold mt-1">{fmt(totalValue)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Total Modal</p>
          <p className="text-lg font-bold mt-1">{fmt(totalCost)}</p>
        </div>
        <div className={`rounded-xl p-4 border ${totalPnl >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          <p className="text-xs text-muted-foreground">P&L</p>
          <p className={`text-lg font-bold mt-1 ${totalPnl >= 0 ? "text-green-500" : "text-red-500"}`}>{fmtPct(totalPnlPct)}</p>
        </div>
      </div>

      {open && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="font-semibold">Tambah Investasi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="text-xs text-muted-foreground">{isStock ? "Cari saham (nama atau kode)" : "Nama"}</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, ticker: isStock ? "" : f.ticker }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" placeholder={isStock ? "mis. BBCA atau Bank Central" : isGold ? "Emas" : "Nama aset"} />
              {suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                  {suggestions.map((sg) => (
                    <li key={sg.symbol}>
                      <button type="button" onClick={() => pickSuggestion(sg)} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex justify-between gap-3">
                        <span className="truncate">{sg.name}</span>
                        <span className="text-muted-foreground shrink-0">{sg.ticker}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tipe</label>
              <select value={form.type} onChange={(e) => changeType(e.target.value)}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm">
                {Object.entries(TYPE_ICONS).map(([k, v]) => <option key={k} value={k}>{v} {TYPE_LABELS[k]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Kode {auto ? "" : "(opsional)"}</label>
              <input value={form.ticker} onChange={(e) => setForm((f) => ({ ...f, ticker: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isGold ? "Berat (gram)" : isStock ? "Jumlah lembar" : "Jumlah unit"}</label>
              <input type="number" value={form.units} onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isGold ? "Harga beli rata-rata per gram (IDR)" : "Harga rata-rata (IDR)"}</label>
              <input type="number" value={form.avgPrice} onChange={(e) => setForm((f) => ({ ...f, avgPrice: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{isGold ? "Harga sekarang per gram (IDR)" : "Harga sekarang (IDR)"}</label>
              <input type="number" value={form.currentPrice} onChange={(e) => setForm((f) => ({ ...f, currentPrice: e.target.value }))}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm" />
            </div>
          </div>
          {(priceLoading || priceNote) && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              {priceLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {priceLoading ? "Mengambil harga pasar…" : priceNote}
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={save} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">Simpan</button>
            <button onClick={() => setOpen(false)} className="bg-secondary px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 items-start">
        {investments.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Belum ada investasi.</div>
        ) : investments.map((inv) => {
          const value = inv.units * inv.currentPrice;
          const cost = inv.units * inv.avgPrice;
          const pnl = value - cost;
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
          return (
            <div key={inv.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{TYPE_ICONS[inv.type]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{inv.name}{inv.ticker ? ` (${inv.ticker})` : ""}</p>
                <p className="text-xs text-muted-foreground">{inv.units} {inv.type === "gold" ? "gram" : inv.type === "stock" ? "lembar" : "unit"} · rata-rata {fmt(inv.avgPrice)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{fmt(value)}</p>
                <p className={`text-xs ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}>{fmtPct(pnlPct)}</p>
              </div>
              <button onClick={() => removeInvestment(inv.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
