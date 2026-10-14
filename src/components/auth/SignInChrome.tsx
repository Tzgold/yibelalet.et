"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export function SignInChrome({
  variant,
  errorCode,
}: {
  variant: "landingLink" | "banner" | "intro" | "loading";
  errorCode?: string | null;
}) {
  const t = useT();

  if (variant === "landingLink") {
    return (
      <Link
        href="/"
        className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
      >
        {t("auth.landingPage")}
      </Link>
    );
  }

  if (variant === "loading") {
    return <div className="text-sm text-[var(--text-dim)]">{t("auth.loading")}</div>;
  }

  if (variant === "banner") {
    if (!errorCode) return null;
    const banner =
      errorCode === "config"
        ? "Auth is not configured. Add Supabase env keys first."
        : errorCode === "auth"
          ? "Sign-in failed. Check your phone number and password, then try again."
          : null;
    if (!banner) return null;
    return (
      <p className="max-w-md text-center text-xs text-[var(--negative)]" role="alert">
        {banner}
      </p>
    );
  }

  return (
    <p className="max-w-md text-center text-xs text-[var(--text-dim)]">
      {t("auth.pageIntro")}
    </p>
  );
}
