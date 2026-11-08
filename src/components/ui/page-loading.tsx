"use client";
import { useEffect, useState } from "react";
import { CloudOff, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SLOW_AFTER_MS = 8000;

export function PageLoading() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(t);
  }, []);

  if (slow) {
    return (
      <div className="p-4 md:p-6 max-w-md mx-auto mt-10">
        <Card>
          <CardContent className="py-10 text-center space-y-4">
            <CloudOff className="h-10 w-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <p className="font-medium">Data belum bisa dimuat</p>
              <p className="text-sm text-muted-foreground">
                Koneksi ke server lambat atau terputus. Data kamu aman. Coba muat ulang halaman ini.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Muat ulang
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4" role="status" aria-label="Memuat data">
      <div className="h-6 w-40 rounded-md bg-secondary animate-pulse" />
      <div className="grid sm:grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
      <div className="h-48 rounded-xl border border-border bg-card animate-pulse" />
    </div>
  );
}
