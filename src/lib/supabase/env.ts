export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function resolveDataSourceMode(): "demo" | "supabase" {
  const forced = process.env.LEADERBOARD_DATA_SOURCE;
  if (forced === "demo") return "demo";
  if (forced === "supabase") {
    if (!hasSupabaseEnv()) {
      throw new Error(
        "LEADERBOARD_DATA_SOURCE=supabase but Supabase env vars are missing.",
      );
    }
    return "supabase";
  }
  return hasSupabaseEnv() ? "supabase" : "demo";
}
