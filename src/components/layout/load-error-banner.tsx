"use client";
import { AlertTriangle } from "lucide-react";
import { useFinanceStore } from "@/store/finance-store";

export function LoadErrorBanner() {
  const loadError = useFinanceStore((s) => s.loadError);
  if (!loadError) return null;
  return (
    <div className="m-4 md:mx-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
      <p className="flex-1">Sebagian data belum bisa dimuat, jadi daftar di bawah mungkin kosong.</p>
      <button onClick={() => window.location.reload()} className="font-medium text-primary hover:underline">
        Muat ulang
      </button>
    </div>
  );
}
