import { Sidebar } from "@/components/layout/sidebar";
import { LoadErrorBanner } from "@/components/layout/load-error-banner";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <LoadErrorBanner />
        <div className="w-full max-w-7xl mx-auto">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
