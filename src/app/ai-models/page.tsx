import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { getRepository } from "@/data/get-repository";
import { profileAccessHref } from "@/lib/auth-paths";
import { formatPercent } from "@/lib/format";

export const instant = false;

export default async function AiModelsPage() {
  await connection();
  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const entries = await repo.getLeaderboard({
    profileType: "ai",
    timeRange: "30d",
    metric: "accuracy",
  });

  return (
    <AppShell dataLabel={info.label}>
      <div>
        <header className="mb-8">
          <LinedSectionTitle as="h1">AI Models</LinedSectionTitle>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-[var(--text-muted)] sm:text-base">
            Statistical and machine-learning predictors ranked with the same settlement rules as
            human tipsters.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="rounded-xl border border-[var(--border)] px-6 py-14 text-center text-base text-[var(--text-muted)]">
            No AI profiles available.
          </div>
        ) : (
          <>
            <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.slice(0, 6).map((e) => (
                <li key={e.profile.id}>
                  <Link
                    href={profileAccessHref(e.profile.slug, false)}
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
                        {e.profile.modelType ?? "model"}
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
                    <th className="px-3 py-3.5 font-medium">Model</th>
                    <th className="px-3 py-3.5 font-medium">Version</th>
                    <th className="px-3 py-3.5 font-medium">Settled</th>
                    <th className="px-3 py-3.5 font-medium">Accuracy</th>
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
                        {e.rank}
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
                              {e.profile.modelType ?? "model"}
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
                          href={profileAccessHref(e.profile.slug, false)}
                          className="text-xs font-medium text-[var(--accent)] hover:underline"
                        >
                          View profile →
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
                      href={profileAccessHref(e.profile.slug, false)}
                      className="flex items-center gap-3 px-4 py-3.5"
                    >
                      <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="sm" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{e.profile.displayName}</span>
                        <span className="text-xs text-[var(--text-dim)]">
                          {formatPercent(e.summary.accuracy)} · {e.summary.settledCount} settled
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
    </AppShell>
  );
}
