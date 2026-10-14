export function getSubscribeAmountEtb() {
  const raw = process.env.CHAPA_SUBSCRIBE_AMOUNT_ETB ?? "99";
  const amount = Number(raw);
  return Number.isFinite(amount) && amount > 0 ? amount : 99;
}

export function getSubscribeDays() {
  const raw = process.env.CHAPA_SUBSCRIBE_DAYS ?? "30";
  const days = Number(raw);
  return Number.isFinite(days) && days > 0 ? Math.floor(days) : 30;
}

export function isChapaConfigured() {
  return Boolean(process.env.CHAPA_SECRET_KEY?.trim());
}

/** Mock only when explicitly enabled — real Chapa is the default. */
export function isChapaMockEnabled() {
  return (
    process.env.CHAPA_MOCK === "true" ||
    process.env.NEXT_PUBLIC_CHAPA_MOCK === "true"
  );
}

/** +2519xxxxxxxx → 09xxxxxxxx for Chapa */
export function toChapaPhone(phone?: string | null) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("251") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }
  if (digits.length === 10 && (digits.startsWith("09") || digits.startsWith("07"))) {
    return digits;
  }
  return undefined;
}

export async function initializeChapaPayment(input: {
  amount: number;
  txRef: string;
  phone?: string | null;
  email?: string | null;
  firstName?: string;
  lastName?: string;
  returnUrl: string;
  callbackUrl: string;
  title: string;
  description: string;
}) {
  const secret = process.env.CHAPA_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error(
      "Add CHAPA_SECRET_KEY to .env.local (from https://dashboard.chapa.co → API Keys).",
    );
  }

  const phone_number = toChapaPhone(input.phone);
  const email =
    input.email?.trim() ||
    (phone_number
      ? `${phone_number}@users.yibelalet.et`
      : `subscriber-${Date.now()}@users.yibelalet.et`);

  const payload: Record<string, unknown> = {
    amount: String(input.amount),
    currency: "ETB",
    email,
    first_name: input.firstName ?? "Yibelalet",
    last_name: input.lastName ?? "Subscriber",
    tx_ref: input.txRef,
    callback_url: input.callbackUrl,
    return_url: input.returnUrl,
    customization: {
      title: input.title.slice(0, 16),
      description: input.description.slice(0, 50),
    },
    meta: {
      payment_reason: input.description.slice(0, 80),
    },
  };

  if (phone_number) {
    payload.phone_number = phone_number;
  }

  const res = await fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as {
    status?: string;
    message?: string | string[];
    data?: { checkout_url?: string };
  };

  if (!res.ok || json.status !== "success" || !json.data?.checkout_url) {
    const msg = Array.isArray(json.message)
      ? json.message.join(", ")
      : json.message;
    throw new Error(msg ?? "Could not start Chapa checkout");
  }

  return json.data.checkout_url;
}

export async function verifyChapaPayment(txRef: string) {
  const secret = process.env.CHAPA_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("CHAPA_SECRET_KEY is missing");
  }

  const res = await fetch(
    `https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    },
  );

  const json = (await res.json()) as {
    status?: string;
    data?: { status?: string };
    message?: string;
  };

  if (!res.ok || json.status !== "success") {
    throw new Error(json.message ?? "Could not verify Chapa payment");
  }

  return json.data?.status === "success";
}
