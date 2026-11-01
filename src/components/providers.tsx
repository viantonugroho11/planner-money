"use client";
import { useEffect } from "react";
import { useFinanceStore } from "@/store/finance-store";
import { supabase } from "@/lib/supabase";

export function Providers({ children }: { children: React.ReactNode }) {
  const init = useFinanceStore((s) => s.init);
  const reset = useFinanceStore((s) => s.reset);

  useEffect(() => {
    // Init on mount if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) init();
    });

    // Re-init on sign-in, reset on sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") init();
      if (event === "SIGNED_OUT") reset();
    });

    return () => subscription.unsubscribe();
  }, [init, reset]);

  return <>{children}</>;
}
