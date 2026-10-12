import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export const instant = false;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : null;
  const banner =
    errorCode === "config"
      ? "Auth is not configured. Add Supabase env keys first."
      : errorCode === "auth"
        ? "Google sign-in failed or was cancelled. Try again."
        : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="page-shell flex h-12 items-center justify-between">
          <Link href="/" className="focus-ring flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 rotate-45 bg-[var(--accent)]"
            />
            <span className="text-sm font-semibold">Yibelalet</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            Landing page
          </Link>
        </div>
      </header>
      <main className="page-shell flex flex-1 flex-col items-center justify-center gap-4 py-10">
        {banner ? (
          <p className="max-w-md text-center text-xs text-[var(--negative)]" role="alert">
            {banner}
          </p>
        ) : null}
        <p className="max-w-md text-center text-xs text-[var(--text-dim)]">
          Sign in to open tipster profiles and full prediction history.
        </p>
        <Suspense fallback={<div className="text-sm text-[var(--text-dim)]">Loading…</div>}>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  );
}
