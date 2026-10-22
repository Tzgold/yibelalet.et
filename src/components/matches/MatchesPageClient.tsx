"use client";

import Link from "next/link";
import { useState } from "react";
import type { UpcomingMatchCard } from "@/data/repository";
import { ClubLogo } from "@/components/ui/ClubLogo";
import { useT } from "@/i18n/I18nProvider";
import { formatKickoffLocal } from "@/lib/format";
import { matchDay, shiftMatchDay, MATCHDAY_TIME_ZONE } from "@/lib/matchday";

function splitKickoff(iso: string) {
  const d = new Date(iso);
  return {
    date: d
      .toLocaleDateString(undefined, { day: "2-digit", month: "short", timeZone:MATCHDAY_TIME_ZONE })
      .toUpperCase(),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone:MATCHDAY_TIME_ZONE,
    }),
  };
}

export function MatchesPageClient({ matches, today }: { matches: UpcomingMatchCard[]; today:string }) {
  const t = useT();
  const [day,setDay]=useState(today);
  const [competition,setCompetition]=useState('all');
  const tomorrow=shiftMatchDay(today,1);
  const competitions=[...new Map(matches.map(m=>[m.competition.id,m.competition])).values()].sort((a,b)=>a.name.localeCompare(b.name));
  const visible=matches.filter(m=>(day==='all'||matchDay(m.match.kickoffAt)===day)&&(competition==='all'||m.competition.id===competition));

  return (
    <div className="workspace-matches">
      <header className="workspace-page-header mb-8">
        <p className="company-eyebrow">YIBELALET / {t("nav.matches")}</p>
        <h1>{t("matchesPage.title")}</h1>
        <p className="workspace-page-intro">
          {t("matchesPage.subtitle")}
        </p>
      </header>

      <div className="matchday-toolbar"><div className="matchday-tabs" role="group" aria-label={t('matchday.chooseDay')}>
        {[{value:today,label:t('matchday.today')},{value:tomorrow,label:t('matchday.tomorrow')},{value:'all',label:t('matchday.bothDays')}].map(({value,label})=><button type="button" key={value} aria-pressed={day===value} onClick={()=>setDay(value)}>{label}<span>{matches.filter(m=>value==='all'||matchDay(m.match.kickoffAt)===value).length}</span></button>)}
      </div><label>{t('profile.competition')}<select value={competition} onChange={event=>setCompetition(event.target.value)}><option value="all">{t('leaderboardPage.allCompetitions')}</option>{competitions.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><p>{t('matchday.timezone')}</p></div>
      {visible.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-4 py-12 text-center text-sm text-[var(--text-muted)]">
          {t("matchday.noFixtures")}
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((m) => {
            const { date, time } = splitKickoff(m.match.kickoffAt);
            return (
              <li
                key={m.match.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] px-5 py-6"
              >
                <div className="daily-fixture-heading"><span>{m.competition.name}</span><span>{t(`matchday.${m.match.matchStatus}`)}</span></div>
                <div className="flex items-start justify-center gap-3">
                  <div className="flex w-[40%] flex-col items-center gap-2.5 text-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--border)]">
                      <ClubLogo
                        name={m.homeTeam.name}
                        logoUrl={m.homeTeam.logoUrl}
                        size={42}
                      />
                    </span>
                    <span className="fixture-team-name">
                      {m.homeTeam.name}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg)] text-[9px] font-bold uppercase text-[var(--text-muted)] ring-1 ring-[var(--border)]">
                    {t("common.vs")}
                  </span>
                  <div className="flex w-[40%] flex-col items-center gap-2.5 text-center">
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg)] ring-1 ring-[var(--border)]">
                      <ClubLogo
                        name={m.awayTeam.name}
                        logoUrl={m.awayTeam.logoUrl}
                        size={42}
                      />
                    </span>
                    <span className="fixture-team-name">
                      {m.awayTeam.name}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-3.5 text-[11px] text-[var(--text-muted)]">
                  <span>{date}</span>
                  <span className="h-3 w-px bg-[var(--border)]" aria-hidden />
                  <span>{time}</span>
                </div>

                {m.predictionProfiles?.length ? <div className="fixture-picks"><p>{t('matchday.availablePicks', {count:m.predictionProfiles.length})}</p><div>{m.predictionProfiles.slice(0,3).map(profile=><Link key={profile.slug} href={`/predictors/${profile.slug}?matchday=${matchDay(m.match.kickoffAt)}#profile-open`}>{profile.displayName}<span aria-hidden> ↗</span></Link>)}</div></div> : <p className="fixture-awaiting">{t('matchday.awaitingPicks')}</p>}
                <details className="fixture-details">
                  <summary>{t("common.viewDetails")}<span aria-hidden>+</span></summary>
                  <div><p className="fixture-details-teams">{m.homeTeam.name} {t("common.vs")} {m.awayTeam.name}</p><p>{m.competition.name}</p><p>{formatKickoffLocal(m.match.kickoffAt)}</p>{m.isDemo ? <p>{t("matchesPage.demoFixture")}</p> : null}<Link href={`/leaderboard?competition=${encodeURIComponent(m.competition.id)}`}>{t("matchesPage.comparePredictors")} ↗</Link></div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
