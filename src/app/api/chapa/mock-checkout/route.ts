import { NextResponse } from "next/server";
import { activateSubscriptionByTxRef } from "@/lib/social-store";
import { isChapaMockEnabled } from "@/lib/chapa";

/** Dev-only: skip Chapa UI and activate subscription immediately. */
export async function GET(request: Request) {
  if (!isChapaMockEnabled()) {
    return NextResponse.json({ error: "Chapa mock is disabled" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const txRef = searchParams.get("tx_ref");
  const slug = searchParams.get("slug") ?? "";
  if (!txRef) {
    return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
  }

  await activateSubscriptionByTxRef(txRef);
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(
    `${origin}/predictors/${encodeURIComponent(slug)}?subscribed=1`,
  );
}
