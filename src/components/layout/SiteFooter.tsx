import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/#leaderboard", label: "Rankings" },
  { href: "/#matches", label: "Matches" },
  { href: "/#how-it-works", label: "Methodology" },
  { href: "/#about", label: "About" },
  { href: "/#faq", label: "FAQ" },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="page-shell flex flex-col gap-5 py-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rotate-45 bg-[var(--accent)]"
          />
          <span className="text-sm font-semibold">Yibelalet</span>
        </div>

        <nav
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]"
          aria-label="Footer"
        >
          {NAV.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--text)]">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <nav className="flex gap-4 text-xs text-[var(--text-muted)]" aria-label="Legal">
            {LEGAL.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--text)]">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 text-[var(--text-dim)]">
            <SocialLink label="X" href="https://x.com">
              <path d="M4 4l7.2 9.6L4.6 20H7l5-6.5L16.8 20H20l-7.4-9.9L19.2 4H16.8l-4.6 6L7.4 4H4z" />
            </SocialLink>
            <SocialLink label="Discord" href="https://discord.com">
              <path d="M8 9.5c.7 0 1.2.5 1.2 1.1S8.7 11.7 8 11.7s-1.2-.5-1.2-1.1S7.3 9.5 8 9.5zm8 0c.7 0 1.2.5 1.2 1.1s-.5 1.1-1.2 1.1-1.2-.5-1.2-1.1.5-1.1 1.2-1.1zM7.2 14.8c1.4 1 2.9 1.5 4.8 1.5s3.4-.5 4.8-1.5M5.5 8.2C6.8 6.4 8.8 5.5 12 5.5s5.2.9 6.5 2.7c1 .4 1.7 1.2 2 1.8-.4 2.2-1.5 4.2-2.6 5.4-.7-.3-1.5-.6-2.4-.8.2-.3.4-.7.5-1.1-1 .4-2.1.6-3.9.6s-2.9-.2-3.9-.6c.1.4.3.8.5 1.1-.9.2-1.7.5-2.4.8C3.3 14.2 2.2 12.2 1.8 10c.3-.6 1-1.4 2-1.8z" />
            </SocialLink>
            <SocialLink label="YouTube" href="https://youtube.com">
              <path d="M21.5 8.2a2.6 2.6 0 00-1.8-1.9C18 6 12 6 12 6s-6 0-7.7.3A2.6 2.6 0 002.5 8.2 27 27 0 002 12a27 27 0 00.5 3.8 2.6 2.6 0 001.8 1.9C6 18 12 18 12 18s6 0 7.7-.3a2.6 2.6 0 001.8-1.9A27 27 0 0022 12a27 27 0 00-.5-3.8zM10.4 14.6V9.4L14.8 12l-4.4 2.6z" />
            </SocialLink>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="page-shell flex flex-col gap-2 py-3.5 text-[11px] text-[var(--text-dim)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Yibelalet. All rights reserved.</p>
          <p>Accuracy is not betting profit.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="focus-ring inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
