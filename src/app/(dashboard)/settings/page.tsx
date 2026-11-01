"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinanceStore } from "@/store/finance-store";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Database, Shield, LogOut, Download, ExternalLink, Lock, Check } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { wallets, transactions, categories, budgets, goals, recurring, iouRecords, loans, investments, wishlistItems, eventBudgets, utilityBills, travelPlans, categorizationRules } = useFinanceStore();
  const router = useRouter();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  // Profile edit
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setDisplayName(data.user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  async function handleLogout() {
    setLogoutLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function saveName() {
    if (!displayName.trim()) return;
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName.trim() } });
    setSavingName(false);
    if (!error) { setNameSuccess(true); setTimeout(() => setNameSuccess(false), 2500); }
  }

  async function savePassword() {
    setPwError(null);
    if (newPassword.length < 8) { setPwError("Password minimal 8 karakter."); return; }
    if (newPassword !== confirmPassword) { setPwError("Password tidak cocok."); return; }
    setSavingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) { setPwError(error.message); }
    else { setPwSuccess(true); setNewPassword(""); setConfirmPassword(""); setTimeout(() => setPwSuccess(false), 2500); }
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
    { label: "Travel Plan", n: travelPlans.length },
    { label: "Auto-Kategori", n: categorizationRules.length },
  ];

  const quickLinks = [
    { href: "/export-import", label: "Export / Import Data", icon: Download, desc: "Backup dan restore semua data" },
    { href: "/tax-zakat", label: "Pajak & Zakat", icon: Shield, desc: "Kalkulator PPh 21 dan Zakat Maal" },
    { href: "/categorization-rules", label: "Auto-Kategorisasi", icon: Database, desc: "Aturan otomatis untuk kategorisasi" },
    { href: "/family", label: "Akun Keluarga", icon: User, desc: "Kelola household & share akses" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h1 className="text-xl font-semibold">Pengaturan</h1>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 gap-3">
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

      {/* Account info & edit */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Profil Akun</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {(user.user_metadata?.full_name ?? user.email ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{user.user_metadata?.full_name ?? "—"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

          {/* Edit display name */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nama Tampilan</label>
            <div className="flex gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                placeholder="Nama kamu"
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
              <Button size="sm" onClick={saveName} disabled={savingName || !displayName.trim()}>
                {nameSuccess ? <Check className="h-4 w-4 text-green-400" /> : "Simpan"}
              </Button>
            </div>
          </div>

          {/* Change password */}
          <div className="border-t border-border pt-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Ganti Password</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Password baru (min 8 karakter)"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password baru"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
            />
            {pwError && <p className="text-xs text-destructive">{pwError}</p>}
            {pwSuccess && <p className="text-xs text-green-400">Password berhasil diubah.</p>}
            <Button size="sm" onClick={savePassword} disabled={savingPw || !newPassword}>
              {savingPw ? "Menyimpan..." : "Ubah Password"}
            </Button>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground mb-3">Data tersimpan di Supabase — tersinkronisasi di semua perangkat.</p>
            <Button variant="destructive" onClick={handleLogout} disabled={logoutLoading} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              {logoutLoading ? "Keluar..." : "Logout"}
            </Button>
          </div>
        </CardContent>
      </Card>

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
