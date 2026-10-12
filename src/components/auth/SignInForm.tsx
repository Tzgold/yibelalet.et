"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient, isAuthConfigured } from "@/lib/supabase/client";

type Step = "phone" | "otp";

function normalizePhone(raw: string): string {
  const trimmed = raw.trim().replace(/[\s()-]/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;
  // Default Ethiopia country code when user types local mobile without +
  if (/^0\d{8,10}$/.test(trimmed)) return `+251${trimmed.slice(1)}`;
  if (/^\d{9,15}$/.test(trimmed)) return `+${trimmed}`;
  return trimmed;
}

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/leaderboard";
  return raw;
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const configured = useMemo(() => isAuthConfigured(), []);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth is not configured. Add Supabase URL and anon key to .env.local.");
      return;
    }

    const normalized = normalizePhone(phone);
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
      setError("Enter a valid phone number with country code, e.g. +2519xxxxxxxx");
      return;
    }

    setBusy(true);
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone: normalized,
    });
    setBusy(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setPhone(normalized);
    setStep("otp");
    setMessage("We sent a 6-digit code by SMS. Enter it below.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth is not configured.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit SMS code.");
      return;
    }

    setBusy(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp.trim(),
      type: "sms",
    });
    setBusy(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function signInWithGoogle() {
    setError(null);
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Auth is not configured. Add Supabase URL and anon key to .env.local.");
      return;
    }

    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    setBusy(false);

    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className="w-full max-w-md border border-[var(--border)] bg-[var(--bg-elevated)] p-5 sm:p-6">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Continue with your phone number or Google account. After sign-in you go to the
        leaderboard.
      </p>

      {!configured ? (
        <p className="mt-4 border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-xs text-[var(--text-dim)]">
          Supabase auth env vars are missing. Add{" "}
          <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then enable
          Phone + Google providers in the Supabase dashboard.
        </p>
      ) : null}

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={busy}
        className="focus-ring mt-5 flex w-full items-center justify-center gap-2 border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm font-medium hover:border-[var(--accent)] disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-[var(--text-dim)]">
        <span className="h-px flex-1 bg-[var(--border)]" />
        or phone
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {step === "phone" ? (
        <form onSubmit={sendOtp} className="space-y-3">
          <label className="block text-xs text-[var(--text-dim)]">
            Phone number
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+2519xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="focus-ring mt-1 w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send SMS code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Code sent to <span className="text-[var(--text)]">{phone}</span>
          </p>
          <label className="block text-xs text-[var(--text-dim)]">
            6-digit code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="focus-ring mt-1 w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm tracking-[0.3em]"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify and continue"}
          </button>
          <button
            type="button"
            className="focus-ring w-full text-xs text-[var(--text-dim)] hover:text-[var(--accent)]"
            onClick={() => {
              setStep("phone");
              setOtp("");
              setMessage(null);
              setError(null);
            }}
          >
            Use a different number
          </button>
        </form>
      )}

      {message ? (
        <p className="mt-3 text-xs text-[var(--positive)]" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-xs text-[var(--negative)]" role="alert">
          {error}
        </p>
      ) : null}

      <p className="mt-5 text-center text-xs text-[var(--text-dim)]">
        <Link href="/" className="hover:text-[var(--accent)]">
          ← Back to landing
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l.1.1 6.2 5.2C39.2 37.2 44 33 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
