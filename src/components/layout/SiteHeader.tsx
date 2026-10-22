"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { useT } from "@/i18n/I18nProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";

const LANDING_LINK_DEFS = [
  { href: "/#leaderboard", hash: "leaderboard", key: "nav.rankings" },
  { href: "/#matches", hash: "matches", key: "nav.matches" },
  { href: "/#how-it-works", hash: "how-it-works", key: "nav.methodology" },
  { href: "/#about", hash: "about", key: "nav.about" },
] as const;

const APP_LINK_DEFS = [
  { href: "/leaderboard", key: "nav.leaderboard" },
  { href: "/matches", key: "nav.matches" },
  { href: "/ai-models", key: "nav.aiModels" },
  { href: "/how-it-works", key: "nav.howItWorks" },
] as const;

export function SiteHeader({
  dataLabel,
  variant = "app",
  isAuthenticated = false,
}: {
  dataLabel?: string;
  variant?: "landing" | "app";
  isAuthenticated?: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("leaderboard");

  const landingLinks = useMemo(
    () => LANDING_LINK_DEFS.map((l) => ({ ...l, label: t(l.key) })),
    [t],
  );
  const appLinks = useMemo(
    () => APP_LINK_DEFS.map((l) => ({ ...l, label: t(l.key) })),
    [t],
  );

  useEffect(() => {
    if (variant !== "landing" || pathname !== "/") return;

    const sectionIds = LANDING_LINK_DEFS.map((l) => l.hash);

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
          <BrandLogo />
        </Link>
        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 lg:flex"
          aria-label="Primary"
        >
          {variant === "landing"
            ? landingLinks.map((link) => {
                const active = pathname === "/" && activeHash === link.hash;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "location" : undefined}
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
            : appLinks.map((link) => {
                const active =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
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
          <LanguageSwitch />
          {isAuthenticated ? <Link href="/leaderboard" className="focus-ring workspace-account-link">{t("nav.dashboard")} <span aria-hidden>↗</span></Link> : <><Link
            href="/signin"
            className="focus-ring px-2.5 py-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/signin?mode=register"
            className="focus-ring rounded-md bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--accent-ink)]"
          >
            {t("nav.register")}
          </Link>
          </>}
        </div>
      </div>
      <nav
        className="page-shell flex gap-1 overflow-x-auto border-t border-[var(--border)] py-1.5 lg:hidden"
        aria-label={t("nav.mobile")}
      >
        {variant === "landing"
          ? landingLinks.map((link) => (
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
          : appLinks.map((link) => (
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
