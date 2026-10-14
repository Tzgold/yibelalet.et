"use client";

import { useT } from "@/i18n/I18nProvider";

export function LandingStats({ profileCount }: { profileCount: number }) {
  const t = useT();

  const items = [
    {
      value: String(profileCount),
      label: t("stats.publicProfiles"),
      detail: t("stats.publicProfilesDetail"),
    },
    {
      value: "2",
      label: t("stats.predictorTypes"),
      detail: t("stats.predictorTypesDetail"),
    },
    {
      value: "100%",
      label: t("stats.lockedTips"),
      detail: t("stats.lockedTipsDetail"),
    },
    {
      value: "1",
      label: t("stats.sportFocus"),
      detail: t("stats.sportFocusDetail"),
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
