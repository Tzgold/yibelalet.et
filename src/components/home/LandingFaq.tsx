"use client";

import Link from "next/link";
import { useT } from "@/i18n/I18nProvider";

export function LandingFaq() {
  const t = useT();
  return <section id="faq" className="company-faq company-section">
    <div><p className="company-eyebrow">05 / {t("faq.eyebrow")}</p><h2>{t("company.faqTitle")}</h2><p className="company-section-description">{t("faq.subtitle")}</p><Link href="/signin" className="company-text-link focus-ring">{t("faq.cta")}</Link></div>
    <div className="company-faq-list">{[1, 2, 3, 4].map((n) => <details key={n} open={n === 1}><summary>{t(`faq.q${n}`)}<span aria-hidden>+</span></summary><p>{t(`faq.a${n}`)}</p></details>)}</div>
  </section>;
}
