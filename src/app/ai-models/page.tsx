import { connection } from "next/server";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
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
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold tracking-tight">AI Models</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Statistical and machine-learning predictors ranked with the same settlement rules as
            human tipsters. Model type and version appear on each profile.
          </p>
        </header>

        {entries.length === 0 ? (
          <div className="border border-[var(--border)] px-4 py-10 text-center text-sm text-[var(--text-muted)]">
            No AI profiles available.
          </div>
        ) : (
          <div className="border border-[var(--border)] bg-[var(--bg-elevated)]">
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="text-[11px] uppercase text-[var(--text-dim)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Model</th>
                  <th className="px-3 py-2 font-medium">Version</th>
                  <th className="px-3 py-2 font-medium">Settled</th>
                  <th className="px-3 py-2 font-medium">Accuracy</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.profile.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-dim)]">
                      {e.rank}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="sm" />
                        <span>
                          <span className="block font-medium">{e.profile.displayName}</span>
                          <span className="block text-[11px] text-[var(--text-dim)]">
                            {e.profile.modelType ?? "model"}
                          </span>
                        </span>
                        <TypeBadge type="ai" />
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[var(--text-muted)]">
                      {e.profile.modelVersion ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 tabular">{e.summary.settledCount}</td>
                    <td className="px-3 py-2.5 tabular">
                      {formatPercent(e.summary.accuracy)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={profileAccessHref(e.profile.slug, false)}
                        className="text-xs text-[var(--accent)] hover:underline"
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
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar name={e.profile.displayName} url={e.profile.avatarUrl} size="sm" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{e.profile.displayName}</span>
                      <span className="text-[11px] text-[var(--text-dim)]">
                        {formatPercent(e.summary.accuracy)} · {e.summary.settledCount} settled
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}
