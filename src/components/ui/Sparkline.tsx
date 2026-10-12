/** Tiny trend mark from recent W/L form. Positive slope = more wins lately. */
export function Sparkline({
  form,
}: {
  form: Array<"W" | "L" | "V" | "P">;
}) {
  if (form.length < 2) {
    return <span className="text-[11px] text-[var(--text-dim)]">—</span>;
  }

  const points = form
    .slice()
    .reverse()
    .reduce<number[]>((acc, f) => {
      const prev = acc.length ? acc[acc.length - 1] : 0;
      const next = f === "W" ? prev + 1 : f === "L" ? prev - 1 : prev;
      acc.push(next);
      return acc;
    }, []);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  const w = 56;
  const h = 18;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  const rising = points[points.length - 1] >= points[0];
  const stroke = rising ? "var(--positive)" : "var(--negative)";

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords}
      />
    </svg>
  );
}
