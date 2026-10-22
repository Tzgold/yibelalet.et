import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSessionUser } from "@/lib/auth";
import { Suspense } from "react";

async function AuthenticatedHeader({ dataLabel, variant }: { dataLabel?: string; variant: "landing" | "app" }) {
  const user = await getSessionUser();
  return <SiteHeader dataLabel={dataLabel} variant={variant} isAuthenticated={Boolean(user)} />;
}

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
    <div className={`flex min-h-screen flex-col ${variant === "landing" ? "landing-site" : "workspace-site"}`}>
      <Suspense fallback={<SiteHeader dataLabel={dataLabel} variant={variant} isAuthenticated={false} />}>
        <AuthenticatedHeader dataLabel={dataLabel} variant={variant} />
      </Suspense>
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
