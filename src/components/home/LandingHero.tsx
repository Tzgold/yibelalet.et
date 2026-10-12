import type { UpcomingMatchCard } from "@/data/repository";
import { HeroMatchCarousel } from "@/components/home/HeroMatchCarousel";

export function LandingHero({
  showcaseMatches,
}: {
  showcaseMatches: UpcomingMatchCard[];
}) {
  return (
    <section className="grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
      <div className="animate-fade-up">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--accent)]">
          Football prediction analytics
        </p>
        <h1 className="mt-5 max-w-[18ch] text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-[var(--text)] sm:text-5xl lg:text-[3.6rem]">
          Know who gets it{" "}
          <span className="relative inline-block text-[var(--accent)]">
            right
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-[var(--accent)]/80"
            />
          </span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--text-muted)] sm:text-[17px]">
          Rank tipsters and AI models by recorded football predictions — locked before
          kickoff, settled after the final whistle.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#leaderboard"
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--accent-ink)] transition hover:brightness-105 active:scale-[0.98]"
          >
            Explore rankings
            <span aria-hidden>→</span>
          </a>
          <a
            href="#how-it-works"
            className="focus-ring inline-flex items-center rounded-xl border border-[var(--border-strong)] bg-transparent px-6 py-3 text-sm text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            How rankings work
          </a>
        </div>
      </div>

      <HeroMatchCarousel matches={showcaseMatches} />
    </section>
  );
}
