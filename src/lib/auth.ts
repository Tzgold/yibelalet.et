import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  MOCK_AUTH_COOKIE,
  decodeMockSession,
  isAuthMockEnabled,
} from "@/lib/auth-mock-edge";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  if (isAuthMockEnabled()) {
    const cookieStore = await cookies();
    const mock = decodeMockSession(cookieStore.get(MOCK_AUTH_COOKIE)?.value);
    if (mock) {
      return {
        id: mock.id,
        phone: mock.phone,
        app_metadata: { provider: "mock" },
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      } as Awaited<ReturnType<typeof getSupabaseUser>>;
    }
  }

  if (!hasSupabaseEnv()) return null;
  return getSupabaseUser();
}

async function getSupabaseUser() {
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
