export function InfoTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        className="focus-ring ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--border)] text-[10px] text-[var(--text-dim)]"
        aria-label={text}
        title={text}
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-56 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-left text-xs leading-snug text-[var(--text-muted)] shadow-lg group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
