"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export function SignInChrome({
  variant,
  errorCode,
}: {
  variant: "landingLink" | "banner" | "intro" | "subtitle" | "eyebrow" | "footnote" | "benefitHuman" | "benefitHumanBody" | "benefitRecord" | "benefitRecordBody" | "loading";
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

  if (variant === "benefitHuman") return <>{t("auth.benefitHuman")}</>;
  if (variant === "benefitHumanBody") return <>{t("auth.benefitHumanBody")}</>;
  if (variant === "benefitRecord") return <>{t("auth.benefitRecord")}</>;
  if (variant === "benefitRecordBody") return <>{t("auth.benefitRecordBody")}</>;
  if (variant === "subtitle") return <>{t("auth.pageIntro")}</>;
  if (variant === "eyebrow") return <>{t("hero.eyebrow")}</>;
  if (variant === "footnote") return <>{t("footer.disclaimer")}</>;

  if (variant === "banner") {
    if (!errorCode) return null;
    const banner = errorCode === "config"
      ? t("auth.authNotConfigured")
      : errorCode === "auth"
        ? t("auth.signinFailed")
        : null;
    if (!banner) return null;
    return (
      <p className="max-w-md text-center text-xs text-[var(--negative)]" role="alert">
        {banner}
      </p>
    );
  }

  return <>{t("auth.loginTitle")}</>;
}
