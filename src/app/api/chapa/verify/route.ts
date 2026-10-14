import { NextResponse } from "next/server";
import { isChapaConfigured, isChapaMockEnabled, verifyChapaPayment } from "@/lib/chapa";
import { activateSubscriptionByTxRef } from "@/lib/social-store";

/**
 * Chapa callback_url hits this after payment.
 * Query may include tx_ref / trx_ref / status from Chapa.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const txRef =
    searchParams.get("tx_ref") ??
    searchParams.get("trx_ref") ??
    searchParams.get("trxRef");

  if (!txRef) {
    return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
  }

  try {
    if (!isChapaMockEnabled()) {
      if (!isChapaConfigured()) {
        return NextResponse.json({ error: "Chapa not configured" }, { status: 503 });
      }
      const ok = await verifyChapaPayment(txRef);
      if (!ok) {
        return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
      }
    }

    const sub = await activateSubscriptionByTxRef(txRef);
    if (!sub) {
      return NextResponse.json({ error: "Unknown transaction" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status: sub.status, tx_ref: txRef });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Verify failed" },
      { status: 502 },
    );
  }
}
