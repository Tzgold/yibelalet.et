"use client";

import type { UpcomingMatchCard } from "@/data/repository";
import type { PredictionView, PredictorProfile } from "@/domain/types";
import { HeroMatchCarousel } from "@/components/home/HeroMatchCarousel";
import { SamplePredictionPanel } from "@/components/home/SamplePredictionPanel";
import { useT } from "@/i18n/I18nProvider";

export function LandingHero({ showcaseMatches, sampleTip, sampleProfile, isAuthenticated }: { showcaseMatches: UpcomingMatchCard[]; sampleTip: PredictionView | null; sampleProfile: PredictorProfile | null; isAuthenticated: boolean }) {
  const t = useT();
  return (
    <section className="company-hero">
      <div className="company-hero-copy animate-fade-up">
        <p className="company-eyebrow"><span className="company-status-dot" aria-hidden />{t("hero.eyebrow")}</p>
        <h1 className="company-hero-title">{t("hero.titleBefore")} <span className="company-title-accent">{t("hero.titleAccent")}.</span></h1>
        <p className="company-hero-description">{t("hero.subtitle")}</p>
        <div className="company-actions">
          <a href="#leaderboard" className="focus-ring company-button company-button-primary">{t("hero.exploreRankings")}<span aria-hidden>↗</span></a>
          <a href="#how-it-works" className="focus-ring company-button company-button-secondary">{t("hero.howRankingsWork")}</a>
        </div>
        <div className="company-hero-proof"><span>{t("about.item1Title")}</span><span>{t("about.item2Title")}</span><span>{t("about.item3Title")}</span></div>
      </div>
      <div className="hero-fixture-preview">
        <div className="hero-preview-heading"><span>{t("heroExtra.featuredTip")}</span><span>01 / Y</span></div>
        {sampleTip ? <SamplePredictionPanel tip={sampleTip} profile={sampleProfile} isAuthenticated={isAuthenticated} /> : <HeroMatchCarousel matches={showcaseMatches} />}
        <p className="hero-preview-caption">{t("how.step1Body")}</p>
      </div>
    </section>
  );
}
