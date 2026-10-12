import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AppShell({
  children,
  dataLabel,
  variant = "app",
}: {
  children: React.ReactNode;
  dataLabel?: string;
  variant?: "landing" | "app";
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader dataLabel={dataLabel} variant={variant} />
      <main className="page-shell flex-1 py-4 sm:py-5">{children}</main>
      <SiteFooter />
    </div>
  );
}
