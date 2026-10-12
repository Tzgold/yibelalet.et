"use client";

import { useState } from "react";

const ITEMS = [
  {
    q: "Is this real tipster performance?",
    a: "The public build ships with labeled demonstration data so you can explore rankings and profiles. When live feeds are connected, demo rows stay clearly marked.",
  },
  {
    q: "Why do I need to sign in to view a profile?",
    a: "The leaderboard is public. Full prediction history, charts, and match analysis require an account so usage stays attributable and abuse stays low.",
  },
  {
    q: "How are rankings calculated?",
    a: "Settled tips only. Accuracy is wins ÷ (wins + losses), with a minimum sample size in the selected period. Human and AI predictors use the same rules.",
  },
  {
    q: "Does accuracy mean betting profit?",
    a: "No. Accuracy is forecast correctness. Profit and ROI appear only when betting records with odds and stakes exist for that tip.",
  },
] as const;

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-8">
      <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Straight answers about data, access, and ranking rules.
      </p>
      <ul className="mt-4 divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        {ITEMS.map((item, index) => {
          const isOpen = open === index;
          return (
            <li key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : index)}
                className="focus-ring flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-sm font-medium">{item.q}</span>
                <span className="text-[var(--accent)]" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <p className="px-4 pb-3.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {item.a}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
