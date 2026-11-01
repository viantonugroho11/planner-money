"use client";
import { useState, useMemo } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const PTKP_TK0 = 54_000_000; // Tidak Kawin
const PTKP_K0 = 58_500_000;  // Kawin
const PTKP_K1 = 63_000_000;  // Kawin + 1 tanggungan
const PTKP_K2 = 67_500_000;  // Kawin + 2
const PTKP_K3 = 72_000_000;  // Kawin + 3

const NISAB_EMAS_GRAM = 85; // gram emas
const EMAS_PRICE_IDR = 1_200_000; // harga emas per gram (estimasi)
const NISAB = NISAB_EMAS_GRAM * EMAS_PRICE_IDR;
const ZAKAT_RATE = 0.025;

function calcPPh21(bruto: number, ptkp: number): number {
  const netto = Math.max(0, bruto - bruto * 0.05 - ptkp); // 5% biaya jabatan
  if (netto <= 60_000_000) return netto * 0.05;
  if (netto <= 250_000_000) return 3_000_000 + (netto - 60_000_000) * 0.15;
  if (netto <= 500_000_000) return 31_500_000 + (netto - 250_000_000) * 0.25;
  if (netto <= 5_000_000_000) return 93_750_000 + (netto - 500_000_000) * 0.30;
  return 1_443_750_000 + (netto - 5_000_000_000) * 0.35;
}

const statusOptions = [
  { label: "TK/0 — Belum menikah", ptkp: PTKP_TK0 },
  { label: "K/0 — Menikah", ptkp: PTKP_K0 },
  { label: "K/1 — Menikah + 1 anak", ptkp: PTKP_K1 },
  { label: "K/2 — Menikah + 2 anak", ptkp: PTKP_K2 },
  { label: "K/3 — Menikah + 3 anak", ptkp: PTKP_K3 },
];

export default function TaxZakatPage() {
  const { transactions, wallets } = useFinanceStore();

  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime();
  const yearlyIncome = useMemo(() =>
    transactions.filter((t) => t.type === "income" && t.date >= yearStart).reduce((s, t) => s + t.amount, 0),
    [transactions, yearStart]
  );
  const monthlyIncome = useMemo(() => {
    const ms = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return transactions.filter((t) => t.type === "income" && t.date >= ms).reduce((s, t) => s + t.amount, 0);
  }, [transactions]);

  const [grossIncome, setGrossIncome] = useState(yearlyIncome);
  const [statusIdx, setStatusIdx] = useState(0);

  const ptkp = statusOptions[statusIdx].ptkp;
  const pph = calcPPh21(grossIncome, ptkp);
  const monthly = pph / 12;

  // Zakat calculation
  const totalWealth = wallets.reduce((s, w) => s + w.balance, 0);
  const zakatDue = totalWealth >= NISAB;
  const zakatAmount = zakatDue ? totalWealth * ZAKAT_RATE : 0;

  // Zakat maal monthly (jika haul setahun)
  const zakatMonthlySaving = yearlyIncome * ZAKAT_RATE / 12;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Pajak &amp; Zakat</h1>

      {/* Income Summary */}
      <Card>
        <CardHeader><CardTitle>Ringkasan Penghasilan</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Pemasukan bulan ini</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(monthlyIncome)}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-muted-foreground text-xs">Pemasukan tahun {now.getFullYear()}</p>
            <p className="text-lg font-bold mt-1">{formatCurrency(yearlyIncome)}</p>
          </div>
        </CardContent>
      </Card>

      {/* PPh 21 Calculator */}
      <Card>
        <CardHeader><CardTitle>Kalkulator PPh 21</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Penghasilan Bruto Tahunan (Rp)</label>
            <input
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
            <p className="text-xs text-muted-foreground">Auto-terisi dari data pemasukan tahun ini</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status Pernikahan &amp; Tanggungan</label>
            <select
              value={statusIdx}
              onChange={(e) => setStatusIdx(Number(e.target.value))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            >
              {statusOptions.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Penghasilan Bruto</span><span>{formatCurrency(grossIncome)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Biaya Jabatan (5%)</span><span>- {formatCurrency(grossIncome * 0.05)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">PTKP ({statusOptions[statusIdx].label.split("—")[0].trim()})</span><span>- {formatCurrency(ptkp)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">PKP (Penghasilan Kena Pajak)</span><span>{formatCurrency(Math.max(0, grossIncome - grossIncome * 0.05 - ptkp))}</span></div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span>PPh 21 Terutang / tahun</span><span className="text-yellow-400">{formatCurrency(pph)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>PPh 21 / bulan</span><span>{formatCurrency(monthly)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">* Perhitungan estimasi berdasarkan tarif PPh 21 terbaru. Konsultasikan dengan konsultan pajak untuk kepastian.</p>
        </CardContent>
      </Card>

      {/* Zakat Maal */}
      <Card>
        <CardHeader><CardTitle>Zakat Maal</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Kekayaan (semua dompet)</span><span>{formatCurrency(totalWealth)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nisab (85gr emas × Rp 1,2jt)</span><span>{formatCurrency(NISAB)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
              <span className={zakatDue ? "text-green-400 font-medium" : "text-muted-foreground"}>
                {zakatDue ? "Wajib Zakat" : "Belum Nisab"}
              </span>
            </div>
            {zakatDue && (
              <>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Zakat Maal (2.5%)</span><span className="text-green-400">{formatCurrency(zakatAmount)}</span>
                </div>
              </>
            )}
          </div>

          <div className="bg-secondary rounded-xl p-4 space-y-2 text-sm">
            <p className="font-medium mb-1">Zakat Penghasilan (Profesi)</p>
            <div className="flex justify-between"><span className="text-muted-foreground">Penghasilan tahun ini</span><span>{formatCurrency(yearlyIncome)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Nisab (652 kg beras × Rp 10rb)</span><span>{formatCurrency(6_520_000)}</span></div>
            {yearlyIncome / 12 >= 6_520_000 && (
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Zakat / bulan (2.5%)</span><span className="text-green-400">{formatCurrency(yearlyIncome / 12 * 0.025)}</span>
              </div>
            )}
            {yearlyIncome / 12 < 6_520_000 && (
              <p className="text-muted-foreground text-xs mt-1">Penghasilan bulanan di bawah nisab zakat profesi.</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">* Harga emas dan beras estimasi. Sesuaikan dengan harga aktual di daerah Anda.</p>
        </CardContent>
      </Card>
    </div>
  );
}
