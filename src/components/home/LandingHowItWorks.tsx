"use client";

import Link from "next/link";
import { MIN_SAMPLE_SIZE } from "@/domain/metrics";
import { useT } from "@/i18n/I18nProvider";

export function LandingHowItWorks() {
  const t = useT();
  return <section id="how-it-works" className="company-method company-section">
    <div className="company-section-heading"><div><p className="company-eyebrow">03 / {t("how.title")}</p><h2>{t("company.methodTitle")}</h2></div><div><p className="company-section-description">{t("how.subtitle")}</p><Link href="/how-it-works" className="company-text-link focus-ring">{t("how.fullDocs")}</Link></div></div>
    <ol className="company-method-grid">{[1, 2, 3, 4].map((n) => <li key={n}><span className="company-step-number">0{n}</span><h3>{t(`how.step${n}Title`)}</h3><p>{t(`how.step${n}Body`, { min: MIN_SAMPLE_SIZE })}</p></li>)}</ol>
  </section>;
}
