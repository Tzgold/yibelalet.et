import { NextResponse } from "next/server";
import { getRepository } from "@/data/get-repository";
import {
  getSubscribeAmountEtb,
  getSubscribeDays,
  initializeChapaPayment,
  isChapaConfigured,
  isChapaMockEnabled,
} from "@/lib/chapa";
import { createPendingSubscription } from "@/lib/social-store";
import { getViewer } from "@/lib/viewer";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { slug?: string } | null;
  const slug = body?.slug?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const repo = getRepository();
  const detail = await repo.getProfileDetail(slug, "30d");
  if (!detail) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const amount = getSubscribeAmountEtb();
  const days = getSubscribeDays();
  const txRef = `sub-${detail.profile.id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8)}-${Date.now()}`;

  await createPendingSubscription({
    userId: viewer.id,
    profileId: detail.profile.id,
    amountEtb: amount,
    txRef,
    days,
  });

  const origin = new URL(request.url).origin;
  // After Chapa, land on complete route which verifies then redirects to profile.
  const returnUrl = `${origin}/api/chapa/complete?tx_ref=${encodeURIComponent(txRef)}&slug=${encodeURIComponent(slug)}`;
  const callbackUrl = `${origin}/api/chapa/verify?tx_ref=${encodeURIComponent(txRef)}`;

  if (isChapaMockEnabled()) {
    return NextResponse.json({
      mock: true,
      txRef,
      amount,
      days,
      checkoutUrl: `${origin}/api/chapa/mock-checkout?tx_ref=${encodeURIComponent(txRef)}&slug=${encodeURIComponent(slug)}`,
    });
  }

  if (!isChapaConfigured()) {
    return NextResponse.json(
      {
        error:
          "Chapa is not configured. Add CHAPA_SECRET_KEY from dashboard.chapa.co → API Keys (test or live).",
      },
      { status: 503 },
    );
  }

  try {
    const checkoutUrl = await initializeChapaPayment({
      amount,
      txRef,
      phone: viewer.phone,
      returnUrl,
      callbackUrl,
      title: "Yibelalet Sub",
      description: `${days}d betting tips · ${detail.profile.displayName}`,
    });
    return NextResponse.json({
      mock: false,
      txRef,
      amount,
      days,
      checkoutUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Chapa initialize failed" },
      { status: 502 },
    );
  }
}
