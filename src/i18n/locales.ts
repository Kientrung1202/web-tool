export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "en" ? "vi" : "en";
}

export function buildLocalizedPath(locale: Locale, slug?: string): string {
  return slug ? `/${locale}/${slug}` : `/${locale}`;
}
