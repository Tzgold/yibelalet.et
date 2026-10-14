import { cookies } from "next/headers";
import {
  MOCK_AUTH_COOKIE,
  decodeMockSession,
  isAuthMockEnabled,
} from "@/lib/auth-mock-edge";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Viewer = {
  id: string;
  phone: string | null;
};

export async function getViewer(): Promise<Viewer | null> {
  if (isAuthMockEnabled()) {
    const cookieStore = await cookies();
    const mock = decodeMockSession(cookieStore.get(MOCK_AUTH_COOKIE)?.value);
    if (mock) {
      return { id: mock.id, phone: mock.phone };
    }
  }

  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return {
      id: data.user.id,
      phone: data.user.phone ?? null,
    };
  } catch {
    return null;
  }
}
