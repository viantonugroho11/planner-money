"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ArrowLeftRight, Wallet, BarChart2,
  Bot, Menu, X,
  PieChart, Target, TrendingUp, Tag, RefreshCw, HandCoins,
  Building2, TrendingDown, Heart, DollarSign, Calendar, Zap,
  CalendarDays, Plane, Sparkles, Calculator, Download, Users,
  Send, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const primaryItems = [
  { href: "/", label: "Beranda", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/wallets", label: "Dompet", icon: Wallet },
  { href: "/insights", label: "Insights", icon: BarChart2 },
];

const allGroups = [
  {
    label: "Utama",
    items: [
      { href: "/", label: "Beranda", icon: LayoutDashboard },
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
      { href: "/settings", label: "Pengaturan", icon: Settings },
    ],
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="flex items-stretch h-16">
          {primaryItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors relative",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />
                )}
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}

          {/* Semua button */}
          <button
            onClick={() => setOpen(true)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              open ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
            Semua
          </button>
        </div>
      </nav>

      {/* Bottom sheet overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom sheet */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "80dvh" }}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <p className="text-sm font-semibold mt-2">Semua Fitur</p>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto overscroll-contain px-4 pb-8 space-y-5" style={{ maxHeight: "calc(80dvh - 56px)" }}>
          {allGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {group.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-[11px] font-medium text-center transition-colors",
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="leading-tight">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
