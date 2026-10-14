import { NextResponse } from "next/server";
import { isAuthMockEnabled, startMockRegistration } from "@/lib/auth-mock";

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
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  const result = await startMockRegistration(phone, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mockOtp: result.otp,
    message: `Mock SMS code: ${result.otp}`,
  });
}
