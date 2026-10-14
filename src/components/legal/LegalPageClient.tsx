"use client";

import { LinedSectionTitle } from "@/components/ui/LinedSectionTitle";
import { useT } from "@/i18n/I18nProvider";

export function LegalPageClient({
  kind,
}: {
  kind: "privacy" | "terms" | "contact";
}) {
  const t = useT();

  if (kind === "privacy") {
    return (
      <article className="mx-auto max-w-3xl">
        <LinedSectionTitle as="h1">{t("legal.privacyTitle")}</LinedSectionTitle>
        <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            {t("legal.privacyBody")}
          </p>
        </div>
      </article>
    );
  }

  if (kind === "terms") {
    return (
      <article className="mx-auto max-w-3xl">
        <LinedSectionTitle as="h1">{t("legal.termsTitle")}</LinedSectionTitle>
        <div className="mt-8 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            {t("legal.termsBody1")}
          </p>
          <p className="text-base leading-relaxed text-[var(--text-muted)]">
            {t("legal.termsBody2")}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      <LinedSectionTitle as="h1">{t("legal.contactTitle")}</LinedSectionTitle>
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 sm:p-8">
        <p className="text-base leading-relaxed text-[var(--text-muted)]">
          {t("legal.contactBody")}{" "}
          <a
            href="mailto:hello@yibelalet.et"
            className="text-[var(--accent)] hover:underline"
          >
            hello@yibelalet.et
          </a>
          .
        </p>
      </div>
    </article>
  );
}
