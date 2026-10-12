import Link from "next/link";

const PITCH_IMG =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1600&q=80";

export function LandingCta() {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[var(--border)]">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${PITCH_IMG})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #0b0d10 0%, rgba(11,13,16,0.92) 42%, rgba(11,13,16,0.55) 68%, rgba(11,13,16,0.28) 100%), radial-gradient(ellipse 50% 80% at 85% 50%, rgba(245,158,11,0.18), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full border border-[rgba(245,158,11,0.3)] opacity-60 sm:h-52 sm:w-52"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-12 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-dashed border-[rgba(255,255,255,0.14)] opacity-50 sm:right-20 sm:h-32 sm:w-32"
      />
      <div className="relative px-5 py-11 sm:px-8 sm:py-14">
        <h2 className="max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">
          Find the predictors worth following.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--text-muted)]">
          Explore recorded football forecasts, compare performance, and make your own
          assessment.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#leaderboard"
            className="focus-ring rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-ink)]"
          >
            Explore rankings →
          </a>
          <Link
            href="/signin"
            className="focus-ring rounded-md border border-[var(--border-strong)] bg-black/25 px-4 py-2.5 text-sm text-[var(--text)] backdrop-blur-sm"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
