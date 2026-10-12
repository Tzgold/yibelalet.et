import { AppShell } from "@/components/layout/AppShell";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";

export default function TermsPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <LinedSectionTitle as="h1">Terms</LinedSectionTitle>
        <div className="mt-8 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            Demonstration profiles and prediction histories are labeled as demo data and are not
            verified real-world tipster performance.
          </p>
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            Rankings are analytical tools, not betting advice. Do not treat accuracy as guaranteed
            profit.
          </p>
        </div>
      </article>
    </AppShell>
  );
}
