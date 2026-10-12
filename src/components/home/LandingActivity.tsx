import Link from "next/link";
import type { RecentSettledTip } from "@/data/repository";
import { Avatar } from "@/components/ui/Avatar";
import { profileAccessHref } from "@/lib/auth-paths";
import { formatRelative } from "@/lib/format";

export function LandingActivity({ tips }: { tips: RecentSettledTip[] }) {
  if (tips.length === 0) return null;

  return (
    <section className="py-6">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Recent settlements</h2>
          <p className="mt-0.5 text-xs text-[var(--text-dim)]">
            Latest win/loss tips across the board · Demo feed
          </p>
        </div>
      </div>
      <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        {tips.map(({ view, profile }) => {
          const win = view.settlementOutcome === "win";
          return (
            <li key={view.id}>
              <Link
                href={profileAccessHref(profile.slug, false)}
                className="focus-ring flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-soft)]"
              >
                <Avatar name={profile.displayName} url={profile.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                    <span className="font-medium">{profile.displayName}</span>
                    <span className="text-[var(--text-dim)]">
                      {view.homeTeam.shortName} vs {view.awayTeam.shortName}
                    </span>
                    <span className="text-[var(--text-dim)]">· {view.selection}</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[var(--text-dim)]">
                    {view.competition.shortName}
                    {view.settledAt ? ` · ${formatRelative(view.settledAt)}` : ""}
                    {profile.isDemo ? " · Demo" : ""}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                    win
                      ? "bg-[var(--positive-soft)] text-[var(--positive)]"
                      : "bg-[var(--negative-soft)] text-[var(--negative)]"
                  }`}
                >
                  {win ? "Win" : "Loss"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
