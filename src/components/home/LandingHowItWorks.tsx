import Link from "next/link";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";

const STEPS = [
  {
    title: "Predictions before kickoff",
    body: "Each tip is timestamped and locked at kickoff — no silent edits after the cutoff.",
  },
  {
    title: "Same scoring for everyone",
    body: "Human tipsters and AI models use identical settlement rules and ranking formulas.",
  },
  {
    title: "Sample size matters",
    body: `At least ${MIN_SAMPLE_SIZE} settled win/loss tips in the selected period to rank. Smaller samples stay visible but marked insufficient.`,
  },
  {
    title: "Accuracy vs profit",
    body: "Accuracy is always shown from settled tips. Profit and ROI appear only when betting records exist.",
  },
] as const;

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-10">
      <div className="flex items-end justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Methodology</h2>
          <p className="mt-1.5 text-sm text-[var(--text-muted)]">
            Documented rules behind the leaderboard — built for recorded performance, not highlight
            reels.
          </p>
        </div>
        <Link
          href="/how-it-works"
          className="shrink-0 text-xs font-medium text-[var(--accent)] hover:underline"
        >
          Full docs →
        </Link>
      </div>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
              Step {index + 1}
            </p>
            <h3 className="mt-2 text-sm font-semibold">{step.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
