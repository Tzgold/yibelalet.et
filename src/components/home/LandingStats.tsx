export function LandingStats({ profileCount }: { profileCount: number }) {
  const items = [
    {
      value: String(profileCount),
      label: "Public profiles",
      detail: "Tipsters and models with tracked prediction histories.",
    },
    {
      value: "2",
      label: "Predictor types",
      detail: "Humans and AI ranked with identical settlement rules.",
    },
    {
      value: "100%",
      label: "Locked tips",
      detail: "No edits after kickoff. No silent backdating.",
    },
    {
      value: "1",
      label: "Sport focus",
      detail: "Built only for football match prediction analytics.",
    },
  ];

  return (
    <section className="border-y border-[var(--border)] py-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[var(--border)] bg-black px-5 py-5 transition hover:border-[rgba(245,158,11,0.35)]"
          >
            <p className="text-3xl font-semibold tracking-tight text-[var(--accent)]">
              {item.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">{item.label}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-dim)]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
