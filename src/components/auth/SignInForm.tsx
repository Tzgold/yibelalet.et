"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient, isAuthConfigured } from "@/lib/supabase/client";
import { useT } from "@/i18n/I18nProvider";

const PREFIX = "+2519";
const MOCK_ENABLED = process.env.NEXT_PUBLIC_AUTH_MOCK === "true";

type Mode = "signin" | "register";
type Step = "form" | "otp";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/leaderboard";
  return raw;
}

function fullPhone(localDigits: string): string {
  return `${PREFIX}${localDigits}`;
}

export function SignInForm() {
  const t = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const initialMode: Mode = searchParams.get("mode") === "register" ? "register" : "signin";
  const configured = useMemo(() => isAuthConfigured() || MOCK_ENABLED, []);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>("form");
  const [localDigits, setLocalDigits] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const phone = fullPhone(localDigits);

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setMockOtpHint(null);
    setMessage(null);
    setError(null);
  }

  function onLocalChange(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    setLocalDigits(digits);
  }

  function validatePhone(): string | null {
    if (!/^\d{8}$/.test(localDigits)) {
      return "Continue after +2519 with the remaining 8 digits.";
    }
    return null;
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const phoneError = validatePhone();
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);

    if (MOCK_ENABLED) {
      const res = await fetch("/api/auth/mock/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBusy(false);
      if (!res.ok) {
        setError(data.error ?? "Sign-in failed.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      setError("Auth is not configured. Add Supabase URL and anon key to .env.local.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      phone,
      password,
    });
    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setMockOtpHint(null);

    const phoneError = validatePhone();
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    if (MOCK_ENABLED) {
      const res = await fetch("/api/auth/mock/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        mockOtp?: string;
        message?: string;
      };
      setBusy(false);
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }
      setStep("otp");
      setMockOtpHint(data.mockOtp ?? "123456");
      setMessage(data.message ?? "Use the mock OTP shown below.");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      setError("Auth is not configured. Add Supabase URL and anon key to .env.local.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      phone,
      password,
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setStep("otp");
    setMessage("We sent a 6-digit code by SMS. Enter it to finish registration.");
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit SMS code.");
      return;
    }

    setBusy(true);

    if (MOCK_ENABLED) {
      const res = await fetch("/api/auth/mock/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otp.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setBusy(false);
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setBusy(false);
      setError("Auth is not configured.");
      return;
    }

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone,
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

  const nextQuery = searchParams.get("next");
  const signInHref = nextQuery
    ? `/signin?next=${encodeURIComponent(nextQuery)}`
    : "/signin";
  const registerHref = nextQuery
    ? `/signin?mode=register&next=${encodeURIComponent(nextQuery)}`
    : "/signin?mode=register";

  return (
    <div className="w-full max-w-md border border-[var(--border)] bg-black p-5 sm:p-6">
      {MOCK_ENABLED ? (
        <p className="mb-4 rounded-md border border-[rgba(245,158,11,0.35)] bg-[var(--accent-soft)] px-3 py-2 text-xs text-[var(--accent)]">
          {t("auth.mockOtpBanner", { code: "123456" })}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border)] p-1">
        <Link
          href={signInHref}
          onClick={() => switchMode("signin")}
          className={`rounded-md px-3 py-2 text-center text-sm font-medium ${
            mode === "signin"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          {t("auth.signIn")}
        </Link>
        <Link
          href={registerHref}
          onClick={() => switchMode("register")}
          className={`rounded-md px-3 py-2 text-center text-sm font-medium ${
            mode === "register"
              ? "bg-[var(--accent)] text-[var(--accent-ink)]"
              : "text-[var(--text-muted)] hover:text-[var(--text)]"
          }`}
        >
          {t("auth.register")}
        </Link>
      </div>

      <h1 className="mt-5 text-xl font-semibold tracking-tight">
        {mode === "signin" ? t("auth.signIn") : t("auth.createAccount")}
      </h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {mode === "signin" ? t("auth.signInHint") : t("auth.registerHint")}
      </p>

      {!configured ? (
        <p className="mt-4 border border-[var(--border)] bg-[var(--bg-soft)] px-3 py-2 text-xs text-[var(--text-dim)]">
          Supabase auth env vars are missing. Add{" "}
          <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-[var(--accent)]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, or set{" "}
          <code className="text-[var(--accent)]">NEXT_PUBLIC_AUTH_MOCK=true</code> for local OTP.
        </p>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={verifyOtp} className="mt-5 space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            {t("auth.codeSentTo")} <span className="text-[var(--text)]">{phone}</span>
          </p>
          {mockOtpHint ? (
            <p className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--accent)]">
              {t("auth.mockCode")}{" "}
              <span className="font-mono tracking-[0.2em]">{mockOtpHint}</span>
            </p>
          ) : null}
          <label className="block text-xs text-[var(--text-dim)]">
            {t("auth.sixDigitCode")}
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
            {busy ? t("auth.verifying") : t("auth.verifyFinish")}
          </button>
          <button
            type="button"
            className="focus-ring w-full text-xs text-[var(--text-dim)] hover:text-[var(--accent)]"
            onClick={() => {
              setStep("form");
              setOtp("");
              setMockOtpHint(null);
              setMessage(null);
              setError(null);
            }}
          >
            {t("auth.editNumber")}
          </button>
        </form>
      ) : (
        <form onSubmit={mode === "signin" ? signIn : register} className="mt-5 space-y-3">
          <label className="block text-xs text-[var(--text-dim)]">
            {t("auth.phoneNumber")}
            <span className="mt-1 flex overflow-hidden border border-[var(--border)] bg-[var(--bg)]">
              <span className="flex items-center border-r border-[var(--border)] px-3 text-sm text-[var(--text)]">
                {PREFIX}
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="xxxxxxxx"
                value={localDigits}
                onChange={(e) => onLocalChange(e.target.value)}
                className="focus-ring w-full bg-transparent px-3 py-2.5 text-sm outline-none"
                maxLength={8}
                required
              />
            </span>
          </label>
          <label className="block text-xs text-[var(--text-dim)]">
            {t("auth.password")}
            <input
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm"
              minLength={8}
              required
            />
          </label>
          {mode === "register" ? (
            <label className="block text-xs text-[var(--text-dim)]">
              {t("auth.confirmPassword")}
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="focus-ring mt-1 w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-sm"
                minLength={8}
                required
              />
            </label>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="focus-ring w-full bg-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent-ink)] disabled:opacity-50"
          >
            {busy
              ? mode === "signin"
                ? t("auth.signingIn")
                : t("auth.sendingCode")
              : mode === "signin"
                ? t("auth.signIn")
                : t("auth.continue")}
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
          {t("auth.backToLanding")}
        </Link>
      </p>
    </div>
  );
}
