import { connection } from "next/server";
import { AppShell } from "@/components/layout/AppShell";
import { AiModelsPageClient } from "@/components/ai-models/AiModelsPageClient";
import { getRepository } from "@/data/get-repository";

export const instant = false;

export default async function AiModelsPage() {
  await connection();
  const repo = getRepository();
  const info = repo.getDataSourceInfo();
  const entries = await repo.getLeaderboard({
    profileType: "ai",
    timeRange: "30d",
    metric: "accuracy",
  });

  return (
    <AppShell dataLabel={info.label}>
      <AiModelsPageClient entries={entries} />
    </AppShell>
  );
}
