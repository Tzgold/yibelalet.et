type LinedSectionTitleProps = {
  children: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
};

/** Centered uppercase title with flanking accent lines (Upcoming Matches style). */
export function LinedSectionTitle({
  children,
  as: Tag = "h2",
  className = "",
}: LinedSectionTitleProps) {
  return (
    <div className={`flex w-full items-center justify-center gap-4 ${className}`}>
      <span
        aria-hidden
        className="h-px min-w-[2.5rem] flex-1 max-w-[7rem] bg-[#8a5f23] sm:max-w-[9rem]"
      />
      <Tag className="shrink-0 text-center text-xs font-bold uppercase tracking-[0.28em] text-[var(--accent)] sm:text-sm">
        {children}
      </Tag>
      <span
        aria-hidden
        className="h-px min-w-[2.5rem] flex-1 max-w-[7rem] bg-[#8a5f23] sm:max-w-[9rem]"
      />
    </div>
  );
}
