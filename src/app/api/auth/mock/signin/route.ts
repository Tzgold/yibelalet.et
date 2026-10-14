import { NextResponse } from "next/server";
import {
  MOCK_AUTH_COOKIE,
  createMockSession,
  encodeMockSession,
  isAuthMockEnabled,
  mockSignIn,
} from "@/lib/auth-mock";

export async function POST(request: Request) {
  if (!isAuthMockEnabled()) {
    return NextResponse.json({ error: "Mock auth is disabled." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    phone?: string;
    password?: string;
  } | null;

  const phone = body?.phone?.trim() ?? "";
  const password = body?.password ?? "";

  if (!/^\+2519\d{8}$/.test(phone)) {
    return NextResponse.json(
      { error: "Use an Ethiopian number like +2519xxxxxxxx." },
      { status: 400 },
    );
  }

  const result = await mockSignIn(phone, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const session = createMockSession(result.user);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MOCK_AUTH_COOKIE, encodeMockSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
