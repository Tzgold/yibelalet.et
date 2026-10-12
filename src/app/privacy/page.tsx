import { AppShell } from "@/components/layout/AppShell";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <LinedSectionTitle as="h1">Privacy</LinedSectionTitle>
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            Yibelalet is currently a development build. Public leaderboard and profile pages expose
            only intentionally public predictor data. When accounts ship, this page will describe
            collection and retention practices in detail — including how phone and Google sign-in
            data is handled.
          </p>
        </div>
      </article>
    </AppShell>
  );
}
