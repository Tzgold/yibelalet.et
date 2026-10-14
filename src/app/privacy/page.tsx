import { AppShell } from "@/components/layout/AppShell";
import { LegalPageClient } from "@/components/legal/LegalPageClient";

export default function PrivacyPage() {
  return (
    <AppShell>
      <LegalPageClient kind="privacy" />
    </AppShell>
  );
}
