import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { MatchesPageClient } from "@/components/matches/MatchesPageClient";
import { getRepository } from "@/data/get-repository";
import { matchDay } from "@/lib/matchday";

export const instant = false;

export default async function MatchesPage() {
  await connection();
  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const today = matchDay(new Date());
  const matches = await repo.getUpcomingMatches(300,today,2);

  return (
    <AppShell dataLabel={info.label}>
      <MatchesPageClient matches={matches} today={today} />
    </AppShell>
  );
}
