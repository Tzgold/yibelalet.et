import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { MatchesPageClient } from "@/components/matches/MatchesPageClient";
import { getRepository } from "@/data/get-repository";

export const instant = false;

export default async function MatchesPage() {
  await connection();
  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const matches = await repo.getUpcomingMatches(18);

  return (
    <AppShell dataLabel={info.label}>
      <MatchesPageClient matches={matches} />
    </AppShell>
  );
}
