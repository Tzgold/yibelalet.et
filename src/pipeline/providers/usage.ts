import { pipelineDb } from "../db";
import type { ProviderName } from "./types";

export async function recordUsage(provider: ProviderName, requests: number, credits: number, error?: string) {
  const { error: failure } = await pipelineDb().rpc("record_pipeline_usage", {
    p_provider: provider, p_requests: requests, p_credits: credits, p_error: error ?? null,
  });
  if (failure) throw new Error(`Provider accounting: ${failure.message}`);
}

export async function usageFor(provider: ProviderName) {
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await pipelineDb().from("pipeline_provider_usage").select("*")
    .eq("provider", provider).in("period", [day, day.slice(0, 7)]);
  if (error) throw new Error(`Provider accounting: ${error.message}`);
  const today = data.find((r) => r.period === day);
  const month = data.find((r) => r.period === day.slice(0, 7));
  return { requestsToday: today?.requests ?? 0, creditsThisMonth: month?.credits ?? 0,
    lastError: today?.last_error ?? null, lastErrorAt: today?.last_error_at ? new Date(today.last_error_at) : null };
}
