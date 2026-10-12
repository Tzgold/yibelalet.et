import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function requireUser(nextPath: string) {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export { profileAccessHref } from "@/lib/auth-paths";
