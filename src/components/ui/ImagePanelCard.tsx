type ImagePanelCardProps = {
  imageUrl: string;
  title: string;
  body: string;
  eyebrow?: string;
  className?: string;
};

/** Photo panel with CTA-style left gradient — image stays visible on the right. */
export function ImagePanelCard({
  imageUrl,
  title,
  body,
  eyebrow,
  className = "",
}: ImagePanelCardProps) {
  return (
    <article
      className={`relative min-h-[270px] overflow-hidden rounded-xl border border-[var(--border)] sm:min-h-[290px] ${className}`}
    >
      {/* Base fill so failed images never look empty-black */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(135deg,#1a1520_0%,#12151a_45%,#1c1810_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(95deg, rgba(11,13,16,0.94) 0%, rgba(11,13,16,0.82) 42%, rgba(11,13,16,0.35) 70%, rgba(11,13,16,0.12) 100%), radial-gradient(ellipse 55% 80% at 90% 50%, rgba(245,158,11,0.16), transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full border border-[rgba(245,158,11,0.22)] opacity-50"
      />
      <div className="relative flex h-full min-h-[270px] flex-col justify-center px-6 py-8 sm:min-h-[290px] sm:px-7">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {eyebrow}
          </p>
        ) : null}
        <h3
          className={`max-w-[16rem] text-xl font-semibold tracking-tight text-[var(--text)] sm:text-2xl ${
            eyebrow ? "mt-2" : ""
          }`}
        >
          {title}
        </h3>
        <p className="mt-3 max-w-[17rem] text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
          {body}
        </p>
      </div>
    </article>
  );
}
