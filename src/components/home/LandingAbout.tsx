export function LandingAbout() {
  const items = [
    {
      title: "Verified records",
      body: "Every prediction is timestamped before kickoff and locked.",
      icon: ShieldIcon,
    },
    {
      title: "Fair comparison",
      body: "The same scoring rules and minimum sample requirements apply to all predictors.",
      icon: ChartIcon,
    },
    {
      title: "Full transparency",
      body: "Explore accuracy, calibration, sample size and performance over time.",
      icon: ListIcon,
    },
  ];

  return (
    <section id="about" className="scroll-mt-20 py-10">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          About
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Why our rankings are trustworthy
        </h2>
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">
          Built for recorded performance — not highlight reels.
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/80 p-5"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]">
              <item.icon />
            </span>
            <h3 className="mt-3.5 text-sm font-semibold">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
