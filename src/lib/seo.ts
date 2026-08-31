import type { Metadata } from "next";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export function buildMetadata(locale: Locale, title: string, description: string, slug?: string): Metadata {
  const path = buildLocalizedPath(locale, slug);

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${path}`,
      languages: {
        en: `${SITE_URL}${buildLocalizedPath("en", slug)}`,
        vi: `${SITE_URL}${buildLocalizedPath("vi", slug)}`,
        "x-default": `${SITE_URL}${buildLocalizedPath("en", slug)}`
      }
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path}`,
      type: "website",
      locale
    }
  };
}
