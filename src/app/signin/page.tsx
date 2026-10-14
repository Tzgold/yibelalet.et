import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { SignInChrome } from "@/components/auth/SignInChrome";

export const instant = false;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : null;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="page-shell flex h-12 items-center justify-between gap-3">
          <Link href="/" className="focus-ring flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 rotate-45 bg-[var(--accent)]"
            />
            <span className="text-sm font-semibold">Yibelalet</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <SignInChrome variant="landingLink" />
          </div>
        </div>
      </header>
      <main className="page-shell flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <SignInChrome variant="banner" errorCode={errorCode} />
        <SignInChrome variant="intro" />
        <Suspense fallback={<SignInChrome variant="loading" />}>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  );
}
