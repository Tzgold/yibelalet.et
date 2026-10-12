export function LandingStats({ profileCount }: { profileCount: number }) {
  const items = [
    {
      value: String(profileCount),
      label: "Demo profiles",
      detail: "Explore tipsters and AI models with recorded histories.",
      icon: UsersIcon,
    },
    {
      value: "2",
      label: "Predictor types",
      detail: "Human tipsters and AI models, ranked the same way.",
      icon: BrainIcon,
    },
    {
      value: "100%",
      label: "Timestamped predictions",
      detail: "No edits, no backdating.",
      icon: ClockIcon,
    },
    {
      value: "1",
      label: "Football only",
      detail: "Focused on the world’s most popular sport.",
      icon: BallIcon,
    },
  ];

  return (
    <section className="grid gap-5 border-y border-[var(--border)] py-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex gap-3">
          <span className="mt-0.5 shrink-0 text-[var(--accent)]">
            <item.icon />
          </span>
          <div>
            <p className="text-sm font-semibold leading-snug">
              <span className="text-[var(--accent)]">{item.value}</span>{" "}
              <span className="text-[var(--text)]">{item.label}</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">{item.detail}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 18c.8-2.5 2.8-4 5.5-4s4.7 1.5 5.5 4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 18c.4-1.5 1.5-2.7 3-3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4a3 3 0 00-3 3v1a3 3 0 000 6v1a3 3 0 003 3M15 4a3 3 0 013 3v1a3 3 0 010 6v1a3 3 0 01-3 3M9 4h6M9 20h6M12 4v16"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 4l2.5 4H16l-3 3 1 5-4-2.5L6 16l1-5-3-3h3.5L12 4z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
