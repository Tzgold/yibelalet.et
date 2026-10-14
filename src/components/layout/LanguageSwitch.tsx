"use client";

import { LOCALES, localeLabel, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className="inline-flex overflow-hidden rounded-md border border-[var(--border)]"
      role="group"
      aria-label={t("lang.switchTo")}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code as Locale)}
            className={`focus-ring px-2 py-1 text-[11px] font-semibold tracking-wide transition ${
              active
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
            aria-pressed={active}
            title={code === "am" ? t("lang.am") : t("lang.en")}
          >
            {localeLabel(code)}
          </button>
        );
      })}
    </div>
  );
}
