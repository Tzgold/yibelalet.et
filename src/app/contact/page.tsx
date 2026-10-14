import { AppShell } from "@/components/layout/AppShell";
import { LegalPageClient } from "@/components/legal/LegalPageClient";

export default function ContactPage() {
  return (
    <AppShell>
      <LegalPageClient kind="contact" />
    </AppShell>
  );
}
