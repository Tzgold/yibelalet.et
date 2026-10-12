"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LANDING_LINKS = [
  { href: "/#leaderboard", hash: "leaderboard", label: "Rankings" },
  { href: "/#matches", hash: "matches", label: "Matches" },
  { href: "/#how-it-works", hash: "how-it-works", label: "Methodology" },
  { href: "/#about", hash: "about", label: "About" },
] as const;

const APP_LINKS = [
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/matches", label: "Matches" },
  { href: "/ai-models", label: "AI Models" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export function SiteHeader({
  dataLabel,
  variant = "app",
}: {
  dataLabel?: string;
  variant?: "landing" | "app";
}) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("leaderboard");

  useEffect(() => {
    if (variant !== "landing" || pathname !== "/") return;

    const sectionIds = LANDING_LINKS.map((l) => l.hash);

    function syncFromHash() {
      const raw = window.location.hash.replace(/^#/, "");
      if (raw && (sectionIds as readonly string[]).includes(raw)) {
        setActiveHash(raw);
      }
    }

    syncFromHash();

    const observers: IntersectionObserver[] = [];
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveHash(id);
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    }

    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      observers.forEach((o) => o.disconnect());
    };
  }, [variant, pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(11,13,16,0.96)] backdrop-blur-md">
      <div className="page-shell relative flex h-14 items-center justify-between gap-4">
        <Link
          href={variant === "landing" ? "/" : "/leaderboard"}
          className="focus-ring flex shrink-0 items-center gap-2.5"
        >
          <span
            aria-hidden
            className="inline-block h-3.5 w-3.5 rotate-45 bg-[var(--accent)]"
          />
          <span className="text-[15px] font-semibold tracking-tight">Yibelalet</span>
        </Link>
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 md:flex"
          aria-label="Primary"
        >
          {variant === "landing"
            ? LANDING_LINKS.map((link) => {
                const active = pathname === "/" && activeHash === link.hash;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`focus-ring relative px-2.5 py-1 text-[13px] ${
                      active
                        ? "text-[var(--text)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute inset-x-2 -bottom-[15px] h-0.5 bg-[var(--accent)]" />
                    ) : null}
                  </a>
                );
              })
            : APP_LINKS.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`focus-ring relative px-2.5 py-1 text-[13px] ${
                      active
                        ? "text-[var(--text)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {link.label}
                    {active ? (
                      <span className="absolute inset-x-2 -bottom-[15px] h-0.5 bg-[var(--accent)]" />
                    ) : null}
                  </Link>
                );
              })}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          {dataLabel && variant === "app" ? (
            <span
              className="hidden max-w-[12rem] truncate border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-dim)] lg:inline"
              title={dataLabel}
            >
              {dataLabel}
            </span>
          ) : null}
          <Link
            href="/signin"
            className="focus-ring px-2.5 py-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Sign in
          </Link>
          <Link
            href="/signin"
            className="focus-ring rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent-ink)]"
          >
            Get started
          </Link>
        </div>
      </div>
      <nav
        className="page-shell flex gap-1 overflow-x-auto border-t border-[var(--border)] py-1.5 md:hidden"
        aria-label="Mobile"
      >
        {variant === "landing"
          ? LANDING_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`focus-ring whitespace-nowrap px-2 py-1 text-xs ${
                  activeHash === link.hash
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {link.label}
              </a>
            ))
          : APP_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring whitespace-nowrap px-2 py-1 text-xs text-[var(--text-muted)]"
              >
                {link.label}
              </Link>
            ))}
      </nav>
    </header>
  );
}
