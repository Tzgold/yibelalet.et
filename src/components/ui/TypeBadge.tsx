export function TypeBadge({ type }: { type: "human" | "ai" }) {
  const isAi = type === "ai";
  return (
    <span
      className="inline-flex shrink-0 items-center rounded px-1 py-px text-[9px] font-semibold uppercase leading-none tracking-wide"
      style={{
        color: isAi ? "var(--ai)" : "var(--accent-ink)",
        background: isAi ? "rgba(106,167,255,0.14)" : "var(--accent)",
      }}
    >
      {isAi ? "AI" : "Human"}
    </span>
  );
}
