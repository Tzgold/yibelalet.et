import { AppShell } from "@/components/layout/AppShell";
import { LegalPageClient } from "@/components/legal/LegalPageClient";

export default function TermsPage() {
  return (
    <AppShell>
      <LegalPageClient kind="terms" />
    </AppShell>
  );
}
