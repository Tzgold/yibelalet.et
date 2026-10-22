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
    <section className="company-stats border-y border-white/[0.09] py-7 sm:py-8">
      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:gap-0">
        {items.map((item) => (
          <div
            key={item.label}
            className="px-4 first:pl-0 sm:border-r sm:border-white/[0.09] sm:px-6 sm:last:border-0 sm:first:pl-0"
          >
            <p className="text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
              {item.value}
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--text)]">{item.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-dim)]">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
