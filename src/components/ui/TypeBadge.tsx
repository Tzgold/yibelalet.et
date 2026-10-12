export function TypeBadge({ type }: { type: "human" | "ai" }) {
  const isAi = type === "ai";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: isAi ? "var(--ai)" : "var(--accent-ink)",
        background: isAi ? "rgba(106,167,255,0.14)" : "var(--accent)",
        border: `1px solid ${isAi ? "rgba(106,167,255,0.35)" : "transparent"}`,
      }}
    >
      {isAi ? "AI" : "Human"}
    </span>
  );
}
