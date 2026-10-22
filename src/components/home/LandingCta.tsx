"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export function LandingCta() {
  const t = useT();
  return <section className="company-cta"><div><p className="company-eyebrow">YIBELALET / FOOTBALL INTELLIGENCE</p><h2>{t("cta.title")}</h2><p>{t("cta.subtitle")}</p></div><Link href="/leaderboard" className="focus-ring company-button">{t("cta.explore")}<span aria-hidden>↗</span></Link><span className="company-cta-watermark" aria-hidden>Y.</span></section>;
}
