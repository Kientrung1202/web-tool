import type { Metadata } from "next";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const SITE_NAME = "Shining PDF Tools";
const OG_IMAGE = "/og-image.jpg";

export function buildMetadata(locale: Locale, title: string, description: string, slug?: string): Metadata {
  const path = buildLocalizedPath(locale, slug);
  const url = `${SITE_URL}${path}`;
  const ogImageUrl = `${SITE_URL}${OG_IMAGE}`;

  return {
    title: slug ? title : { absolute: title },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}${buildLocalizedPath("en", slug)}`,
        vi: `${SITE_URL}${buildLocalizedPath("vi", slug)}`,
        "x-default": `${SITE_URL}${buildLocalizedPath("en", slug)}`
      }
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
          type: "image/jpeg"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl]
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  };
}
