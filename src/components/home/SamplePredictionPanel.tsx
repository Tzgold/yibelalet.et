"use client";

import Link from "next/link";
import type { PredictionView, PredictorProfile } from "@/domain/types";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { Avatar } from "@/components/ui/Avatar";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { profileAccessHref } from "@/lib/auth-paths";
import { formatKickoffLocal, marketLabel, selectionLabel } from "@/lib/format";
import { useT } from "@/i18n/I18nProvider";

export function SamplePredictionPanel({ tip, profile, isAuthenticated }: { tip: PredictionView; profile: PredictorProfile | null; isAuthenticated: boolean }) {
  const t = useT();
  return (
    <aside className="forecast-sheet" aria-label={t("heroExtra.featuredTip")}>
      <div className="forecast-sheet-header"><span>{tip.competition.name}</span><span className="forecast-open">{t("common.pending")}</span></div>
      <div className="forecast-teams">
        <div><ClubLogo name={tip.homeTeam.name} logoUrl={tip.homeTeam.logoUrl} size={60} loading="eager" /><p>{tip.homeTeam.name}</p></div>
        <span className="forecast-vs">{t("common.vs")}</span>
        <div><ClubLogo name={tip.awayTeam.name} logoUrl={tip.awayTeam.logoUrl} size={60} loading="eager" /><p>{tip.awayTeam.name}</p></div>
      </div>
      <p className="forecast-kickoff">{formatKickoffLocal(tip.match.kickoffAt)}</p>
      <div className="forecast-selection"><div><span>{marketLabel(tip.marketType)}</span><p>{tip.accessLocked ? t("profile.subscriberPick") : selectionLabel(tip.selection, tip.homeTeam.name, tip.awayTeam.name)}</p></div><span aria-hidden>↗</span></div>
      <div className="forecast-probability"><span>{t("profile.publishedAt")}</span><strong>{formatKickoffLocal(tip.publishedAt)}</strong></div>
      {profile ? <Link href={profileAccessHref(profile.slug, isAuthenticated)} className="forecast-author focus-ring"><Avatar name={profile.displayName} url={profile.avatarUrl} size="sm" /><span><span className="forecast-author-name">{profile.displayName} <TypeBadge type={profile.profileType} /></span><span>{t("common.viewProfile")}</span></span><span aria-hidden>↗</span></Link> : null}
      {tip.sourceMetadata === "demo-seed" ? <p className="forecast-disclosure">{t("heroExtra.sampleTip")}</p> : null}
    </aside>
  );
}
