import type { PredictionView } from "@/domain/types";
import {
  formatKickoffLocal,
  formatPercent,
  marketLabel,
  selectionLabel,
} from "@/lib/format";

/** Compact tip panel from a real open prediction in the dataset. */
export function SamplePredictionPanel({ tip }: { tip: PredictionView }) {
  const p = tip.probability ?? 0;

  return (
    <aside className="border border-[var(--border)] bg-[var(--bg-elevated)] p-3 sm:w-72">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-dim)]">
        {tip.competition.shortName}
      </p>
      <p className="mt-1 text-sm font-semibold leading-snug">
        {tip.homeTeam.name} vs {tip.awayTeam.name}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">
        {formatKickoffLocal(tip.match.kickoffAt)}
      </p>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <p className="text-[11px] text-[var(--text-muted)]">{marketLabel(tip.marketType)}</p>
        <p className="mt-1 text-sm text-[var(--accent)]">
          {selectionLabel(tip.selection, tip.homeTeam.name, tip.awayTeam.name)}
        </p>
        {tip.probability != null ? (
          <>
            <div className="mt-2 flex justify-between text-[11px]">
              <span className="text-[var(--text-dim)]">Published probability</span>
              <span className="tabular">{formatPercent(p, 0)}</span>
            </div>
            <div className="mt-1 h-1 bg-[var(--bg-soft)]">
              <div
                className="h-1 bg-[var(--accent)]"
                style={{ width: `${Math.round(p * 100)}%` }}
              />
            </div>
          </>
        ) : null}
      </div>
      <p className="mt-3 text-[10px] leading-snug text-[var(--text-dim)]">
        Sample from demo open tip · not a live bookmaker market.
      </p>
    </aside>
  );
}
