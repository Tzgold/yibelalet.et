import { resolveDataSourceMode } from "@/lib/supabase/env";
import { DemoRepository } from "./demo/demo-repository";
import type { PredictorRepository } from "./repository";
import { SupabaseRepository } from "./supabase/supabase-repository";

export function getRepository(): PredictorRepository {
  const mode = resolveDataSourceMode();
  if (mode === "supabase") return new SupabaseRepository();
  return new DemoRepository();
}
