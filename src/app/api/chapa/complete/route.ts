import { NextResponse } from "next/server";
import { isChapaConfigured, isChapaMockEnabled, verifyChapaPayment } from "@/lib/chapa";
import { activateSubscriptionByTxRef } from "@/lib/social-store";

/** Browser return_url after Chapa checkout — verify then send user back to profile. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = new URL(request.url).origin;
  const txRef =
    searchParams.get("tx_ref") ??
    searchParams.get("trx_ref") ??
    searchParams.get("trxRef");
  const slug = searchParams.get("slug") ?? "";

  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/predictors/${encodeURIComponent(slug)}?subscribe_error=${encodeURIComponent(reason)}`,
    );

  if (!txRef) return fail("missing_tx");

  try {
    if (!isChapaMockEnabled()) {
      if (!isChapaConfigured()) return fail("chapa_not_configured");
      const ok = await verifyChapaPayment(txRef);
      if (!ok) return fail("payment_failed");
    }

    const sub = await activateSubscriptionByTxRef(txRef);
    if (!sub) return fail("unknown_tx");

    return NextResponse.redirect(
      `${origin}/predictors/${encodeURIComponent(slug)}?subscribed=1`,
    );
  } catch (e) {
    return fail(e instanceof Error ? e.message : "verify_failed");
  }
}
