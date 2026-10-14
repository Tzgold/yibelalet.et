"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export function NotFoundClient() {
  const t = useT();

  return (
    <div className="surface mx-auto max-w-lg rounded-xl p-8 text-center">
      <h1 className="text-xl font-semibold">{t("errors.notFoundTitle")}</h1>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{t("errors.notFoundBody")}</p>
      <Link
        href="/leaderboard"
        className="focus-ring mt-5 inline-flex rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#1a1208]"
      >
        {t("errors.backLeaderboard")}
      </Link>
    </div>
  );
}
