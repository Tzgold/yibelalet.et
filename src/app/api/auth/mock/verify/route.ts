import { NextResponse } from "next/server";
import {
  MOCK_AUTH_COOKIE,
  createMockSession,
  encodeMockSession,
  isAuthMockEnabled,
  verifyMockRegistration,
} from "@/lib/auth-mock";

export async function POST(request: Request) {
  if (!isAuthMockEnabled()) {
    return NextResponse.json({ error: "Mock auth is disabled." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    phone?: string;
    otp?: string;
  } | null;

  const phone = body?.phone?.trim() ?? "";
  const otp = body?.otp?.trim() ?? "";

  const result = await verifyMockRegistration(phone, otp);
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
