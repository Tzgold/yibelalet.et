export type Locale = "en" | "am";

export const LOCALES: Locale[] = ["en", "am"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "yibelalet_locale";

export function parseLocale(value?: string | null): Locale {
  return value === "am" ? "am" : "en";
}

export function localeLabel(locale: Locale): string {
  return locale === "am" ? "አማ" : "EN";
}
