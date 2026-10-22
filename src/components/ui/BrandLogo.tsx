/** Shared vector identity: a Y built from two converging tracks inside a shield. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={`brand-mark ${className}`} width="36" height="40" viewBox="0 0 36 40" fill="none" aria-hidden="true">
      <path d="M18 2 33 8v14c0 7-8 12-15 16C11 34 3 29 3 22V8L18 2Z" fill="currentColor" fillOpacity=".06" stroke="currentColor" strokeWidth="1.5" />
      <path d="m9 11 9 9 9-9v7l-6 6v7l-3 2-3-2v-7l-6-6v-7Z" fill="currentColor" />
      <path d="M18 7v6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function BrandLogo() {
  return <span className="brand-lockup"><BrandMark /><span className="brand-wordmark">Yibelalet<span className="brand-period">.</span></span></span>;
}
