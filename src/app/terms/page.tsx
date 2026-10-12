import { AppShell } from "@/components/layout/AppShell";

export default function TermsPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl space-y-3">
        <h1 className="text-xl font-semibold">Terms</h1>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">
          Demonstration profiles and prediction histories are labeled as demo data and are not
          verified real-world tipster performance. Rankings are analytical tools, not betting
          advice. Do not treat accuracy as guaranteed profit.
        </p>
      </article>
    </AppShell>
  );
}
