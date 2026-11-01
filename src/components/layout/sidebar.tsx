"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, Target, Settings, TrendingUp, LogOut, BarChart2, Tag, RefreshCw, Send, HandCoins, Heart, Building2, TrendingDown, Calendar, Zap, Bot, DollarSign, Download, Calculator, Plane, CalendarDays, Sparkles, Receipt, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
      { href: "/transfer", label: "Transfer", icon: Send },
      { href: "/wallets", label: "Dompet", icon: Wallet },
    ],
  },
  {
    label: "Analitik",
    items: [
      { href: "/insights", label: "Insights", icon: BarChart2 },
      { href: "/budgets", label: "Anggaran", icon: PieChart },
      { href: "/goals", label: "Tujuan", icon: Target },
      { href: "/net-worth", label: "Kekayaan Bersih", icon: TrendingUp },
    ],
  },
  {
    label: "Kelola",
    items: [
      { href: "/categories", label: "Kategori", icon: Tag },
      { href: "/recurring", label: "Transaksi Rutin", icon: RefreshCw },
      { href: "/iou", label: "Hutang/Piutang", icon: HandCoins },
      { href: "/loans", label: "Pinjaman", icon: Building2 },
    ],
  },
  {
    label: "Investasi & Tabungan",
    items: [
      { href: "/investments", label: "Investasi", icon: TrendingDown },
      { href: "/wishlist", label: "Wishlist", icon: Heart },
      { href: "/salary-allocator", label: "Alokasi Gaji", icon: DollarSign },
    ],
  },
  {
    label: "Lainnya",
    items: [
      { href: "/event-budget", label: "Anggaran Event", icon: Calendar },
      { href: "/utility-bills", label: "Tagihan", icon: Zap },
      { href: "/cashflow-calendar", label: "Kalender Cashflow", icon: CalendarDays },
      { href: "/travel-planner", label: "Travel Planner", icon: Plane },
      { href: "/categorization-rules", label: "Auto-Kategori", icon: Sparkles },
      { href: "/tax-zakat", label: "Pajak & Zakat", icon: Calculator },
      { href: "/export-import", label: "Export / Import", icon: Download },
      { href: "/family", label: "Akun Keluarga", icon: Users },
      { href: "/ai-coach", label: "AI Coach", icon: Bot },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-card border-r border-border p-4 gap-1">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          💰
        </div>
        <div>
          <p className="font-semibold text-sm">Finance AI</p>
          <p className="text-xs text-muted-foreground">Journal</p>
        </div>
      </div>

      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1">{group.label}</p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
