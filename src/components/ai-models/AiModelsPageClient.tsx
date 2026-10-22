"use client";

import Link from "next/link";
import type { LeaderboardEntry } from "@/domain/types";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";
import { formatPercent } from "@/lib/format";
import { useT } from "@/i18n/I18nProvider";

export function AiModelsPageClient({ entries, isAuthenticated = false }: { entries: LeaderboardEntry[]; isAuthenticated?: boolean }) {
  const t = useT();

  return (
    <div className="workspace-models">
      <header className="workspace-page-header mb-8">
        <p className="company-eyebrow">YIBELALET / {t("nav.aiModels")}</p>
        <h1>{t("aiModelsPage.title")}</h1>
        <p className="workspace-page-intro">
          {t("aiModelsPage.subtitle")}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-14 text-center text-base text-[var(--text-muted)]">
          {t("aiModelsPage.empty")}
        </div>
      ) : (
        <>
          <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.slice(0, 6).map((e) => (
              <li key={e.profile.id}>
                <Link
                  href={profileAccessHref(e.profile.slug, isAuthenticated)}
                  className="focus-ring flex h-full items-center gap-3 rounded-xl border border-[var(--border)] bg-black p-4 hover:border-[var(--accent)]"
                >
                  <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold">
                        {e.profile.displayName}
                      </span>
                      <TypeBadge type="ai" />
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--text-dim)]">
                      {e.profile.modelType ?? t("common.model")}
                      {e.profile.modelVersion ? ` · v${e.profile.modelVersion}` : ""}
                      {" · "}
                      {formatPercent(e.summary.accuracy)}
                    </span>
                  </span>
                  <span className="text-xs font-medium text-[var(--accent)]">→</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-black">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-[11px] uppercase tracking-wide text-[var(--text-dim)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3.5 font-medium">#</th>
                  <th className="px-3 py-3.5 font-medium">{t("aiModelsPage.model")}</th>
                  <th className="px-3 py-3.5 font-medium">{t("aiModelsPage.version")}</th>
                  <th className="px-3 py-3.5 font-medium">{t("aiModelsPage.settledCol")}</th>
                  <th className="px-3 py-3.5 font-medium">{t("common.accuracy")}</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr
                    key={e.profile.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--text-dim)]">
                      {e.eligible ? e.rank : "—"}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          name={e.profile.displayName}
                          url={e.profile.avatarUrl}
                          size="sm"
                        />
                        <span>
                          <span className="block font-medium">{e.profile.displayName}</span>
                          <span className="block text-[11px] text-[var(--text-dim)]">
                            {e.profile.modelType ?? t("common.model")}
                          </span>
                        </span>
                        <TypeBadge type="ai" />
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-[var(--text-muted)]">
                      {e.profile.modelVersion ?? "—"}
                    </td>
                    <td className="px-3 py-3.5 tabular">{e.summary.settledCount}</td>
                    <td className="px-3 py-3.5 tabular font-medium">
                      {formatPercent(e.summary.accuracy)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={profileAccessHref(e.profile.slug, isAuthenticated)}
                        className="text-xs font-medium text-[var(--accent)] hover:underline"
                      >
                        {t("common.viewProfile")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="divide-y divide-[var(--border)] md:hidden">
              {entries.map((e) => (
                <li key={e.profile.id}>
                  <Link
                    href={profileAccessHref(e.profile.slug, isAuthenticated)}
                    className="flex items-center gap-3 px-4 py-3.5"
                  >
                    <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="sm" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{e.profile.displayName}</span>
                      <span className="text-xs text-[var(--text-dim)]">
                        {formatPercent(e.summary.accuracy)} · {e.summary.settledCount}{" "}
                        {t("common.settled")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
