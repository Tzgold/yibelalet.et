"use client";

import { useT } from "@/i18n/I18nProvider";

export function LandingAbout() {
  const t = useT();
  return <section id="about" className="company-about company-section">
    <div className="company-about-statement"><p className="company-eyebrow">04 / {t("about.title")}</p><h2>{t("company.aboutTitle")}</h2><p>{t("about.subtitle")}</p><div className="company-record-mark" aria-hidden><span>Y.</span><span>HUMAN × AI<br />FOOTBALL ANALYTICS</span></div></div>
    <div className="company-principles">{[1, 2, 3].map((n) => <article key={n}><span aria-hidden>0{n}</span><div><h3>{t(`about.item${n}Title`)}</h3><p>{t(`about.item${n}Body`)}</p></div></article>)}</div>
  </section>;
}
