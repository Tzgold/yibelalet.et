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
      <main
        className={`page-shell flex-1 ${
          variant === "landing" ? "py-5 sm:py-6" : "py-10 sm:py-14"
        }`}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
