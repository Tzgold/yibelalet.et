import Link from "next/link";
import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { SignInChrome } from "@/components/auth/SignInChrome";
import { BrandLogo, BrandMark } from "@/components/ui/BrandLogo";

export const instant = false;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const errorCode = typeof params.error === "string" ? params.error : null;

  return (
    <div className="auth-site">
      <header className="auth-header">
        <div className="page-shell flex items-center justify-between gap-3">
          <Link href="/" className="focus-ring flex items-center gap-2">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <SignInChrome variant="landingLink" />
          </div>
        </div>
      </header>
      <main className="page-shell auth-layout">
        <div className="auth-story">
          <p className="company-eyebrow"><span className="company-status-dot" aria-hidden /><SignInChrome variant="eyebrow" /></p>
          <h1>
            <SignInChrome variant="intro" />
          </h1>
          <p className="auth-story-description">
            <SignInChrome variant="subtitle" />
          </p>
          <div className="auth-benefits">
            <div><span aria-hidden>01</span><div><h2><SignInChrome variant="benefitHuman" /></h2><p><SignInChrome variant="benefitHumanBody" /></p></div></div>
            <div><span aria-hidden>02</span><div><h2><SignInChrome variant="benefitRecord" /></h2><p><SignInChrome variant="benefitRecordBody" /></p></div></div>
          </div>
          <div className="auth-emblem" aria-hidden><BrandMark /><span>YIBELALET<br />FOOTBALL INTELLIGENCE</span></div>
        </div>
        <div className="auth-form-column">
          <SignInChrome variant="banner" errorCode={errorCode} />
          <Suspense fallback={<SignInChrome variant="loading" />}>
            <SignInForm key={params.mode === "register" ? "register" : "signin"} />
          </Suspense>
        </div>
      </main>
      <footer className="page-shell auth-footer"><span>© 2026 Yibelalet</span><span><SignInChrome variant="footnote" /></span></footer>
    </div>
  );
}
