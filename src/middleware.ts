import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  MOCK_AUTH_COOKIE,
  decodeMockSession,
  isAuthMockEnabled,
} from "@/lib/auth-mock-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Profiles require an authenticated session.
  const isProfileRoute = pathname.startsWith("/predictors/");
  if (!isProfileRoute) {
    return NextResponse.next();
  }

  if (isAuthMockEnabled()) {
    const mock = decodeMockSession(request.cookies.get(MOCK_AUTH_COOKIE)?.value);
    if (mock) {
      return NextResponse.next();
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No auth backend configured — still block profiles and send users to sign-in.
  if (!url || !key) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const signIn = new URL("/signin", request.url);
    signIn.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: ["/predictors/:path*"],
};
