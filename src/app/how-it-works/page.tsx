import { AppShell } from "@/components/layout/AppShell";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";

export default function HowItWorksPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">How rankings work</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Documented scoring rules used by the football leaderboard and profile analytics.
          </p>
        </header>

        <section className="space-y-2 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-sm font-semibold">1. Predictions before kickoff</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Each tip stores a publication timestamp and a lock time at kickoff. After lock or
            settlement, selection and market fields cannot be silently changed.
          </p>
        </section>

        <section className="space-y-2 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-sm font-semibold">2. Accuracy</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Accuracy = wins ÷ (wins + losses). Voids and pushes are excluded from the denominator.
            Draw selections are wins when the match finishes level in a three-way match-result
            market.
          </p>
        </section>

        <section className="space-y-2 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-sm font-semibold">3. Sample size</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Profiles need at least {MIN_SAMPLE_SIZE} settled win/loss predictions in the selected
            period to be ranking-eligible. Smaller samples remain visible but marked insufficient.
          </p>
        </section>

        <section className="space-y-2 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-sm font-semibold">4. Profit and ROI</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Net profit and ROI are shown only when betting records exist with odds, stake, and
            settlement returns. A correct forecast alone never invents financial performance.
          </p>
        </section>

        <section className="space-y-2 border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
          <h2 className="text-sm font-semibold">5. Human vs AI</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Human tipsters and AI models use the same settlement and ranking formulas. Labels
            identify creator type — they do not imply superiority.
          </p>
        </section>
      </article>
    </AppShell>
  );
}
