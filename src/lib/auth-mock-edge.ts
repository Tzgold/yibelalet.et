/** Development-only mock auth helpers (no Node fs/crypto). Used by proxy. */

export const MOCK_OTP = "123456";
export const MOCK_AUTH_COOKIE = "yibelalet_mock_auth";

export type MockSession = {
  id: string;
  phone: string;
  exp: number;
};

export function isAuthMockEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    (process.env.AUTH_MOCK === "true" ||
      process.env.NEXT_PUBLIC_AUTH_MOCK === "true")
  );
}

function toBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeMockSession(session: MockSession) {
  return toBase64Url(JSON.stringify(session));
}

export function decodeMockSession(raw: string | undefined | null): MockSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(raw)) as MockSession;
    if (!parsed?.id || !parsed?.phone || !parsed?.exp) return null;
    if (parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}
