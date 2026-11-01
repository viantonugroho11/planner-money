"use client";
import { useEffect } from "react";
import { useFinanceStore } from "@/store/finance-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useFinanceStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
