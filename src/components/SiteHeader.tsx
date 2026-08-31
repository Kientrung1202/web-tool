"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath, getAlternateLocale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const alternateLocale = getAlternateLocale(locale);
  const alternatePath = pathname?.replace(`/${locale}`, `/${alternateLocale}`) ?? buildLocalizedPath(alternateLocale);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4">
        <Link className="shrink-0 text-sm font-bold tracking-normal text-foreground md:text-base" href={buildLocalizedPath(locale)} aria-label={t(locale, "siteName")}>
          <span className="sm:hidden">PDF</span>
          <span className="hidden sm:inline">{t(locale, "siteName")}</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-1 sm:gap-2" aria-label="Primary">
          <Link className="whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-3 sm:text-sm" href={buildLocalizedPath(locale)}>
            {t(locale, "navTools")}
          </Link>
          <Link className="whitespace-nowrap rounded-md px-2 py-2 text-xs font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground sm:px-3 sm:text-sm" href={buildLocalizedPath(locale, "privacy")}>
            {t(locale, "navPrivacy")}
          </Link>
          <Link className="whitespace-nowrap rounded-md border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground sm:text-sm" href={alternatePath}>
            {alternateLocale.toUpperCase()}
          </Link>
        </nav>
      </div>
    </header>
  );
}
