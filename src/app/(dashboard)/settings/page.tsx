"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/store/finance-store";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Database, Shield, LogOut, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { wallets, transactions, categories, budgets, goals, recurring, iouRecords, loans, investments, wishlistItems, eventBudgets, utilityBills } = useFinanceStore();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const counts = [
    { label: "Dompet", n: wallets.length },
    { label: "Transaksi", n: transactions.length },
    { label: "Kategori", n: categories.length },
    { label: "Anggaran", n: budgets.length },
    { label: "Tujuan Keuangan", n: goals.length },
    { label: "Transaksi Rutin", n: recurring.length },
    { label: "Hutang/Piutang", n: iouRecords.length },
    { label: "Pinjaman", n: loans.length },
    { label: "Investasi", n: investments.length },
    { label: "Wishlist", n: wishlistItems.length },
    { label: "Anggaran Event", n: eventBudgets.length },
    { label: "Tagihan Rutin", n: utilityBills.length },
  ];

  const quickLinks = [
    { href: "/export-import", label: "Export / Import Data", icon: Download, desc: "Backup dan restore semua data" },
    { href: "/tax-zakat", label: "Pajak & Zakat", icon: Shield, desc: "Kalkulator PPh 21 dan Zakat Maal" },
    { href: "/categorization-rules", label: "Auto-Kategorisasi", icon: Database, desc: "Aturan otomatis untuk kategorisasi" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Pengaturan</h1>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-3">
        {quickLinks.map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <Card className="hover:bg-secondary/50 transition-colors cursor-pointer h-full">
              <CardContent className="py-4 space-y-1">
                <Icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Data Summary */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-4 w-4" /> Ringkasan Data</CardTitle></CardHeader>
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

      {/* Account */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Akun</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Data tersimpan di Supabase — tersinkronisasi di semua perangkat saat login dengan akun yang sama.</p>
          <Button variant="destructive" onClick={handleLogout} disabled={logoutLoading} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            {logoutLoading ? "Keluar..." : "Logout"}
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader><CardTitle>Tentang</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Finance AI Journal — Web</p>
          <p>Manajemen keuangan pribadi berbasis AI. Data tersimpan di Supabase dengan isolasi per pengguna.</p>
          <p className="text-xs">Built with Next.js 15, Supabase, Zustand, shadcn/ui</p>
        </CardContent>
      </Card>
    </div>
  );
}
