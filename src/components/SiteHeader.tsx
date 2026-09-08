"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath, getAlternateLocale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const alternateLocale = getAlternateLocale(locale);
  const alternatePath = pathname?.replace(`/${locale}`, `/${alternateLocale}`) ?? buildLocalizedPath(alternateLocale);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4">
        {/* ── Left: Logo + Privacy ── */}
        <div className="flex items-center gap-1">
          <Link
            className="flex shrink-0 items-center gap-2 text-foreground transition-opacity hover:opacity-80"
            href={buildLocalizedPath(locale)}
            aria-label={t(locale, "siteName")}
          >
            <Image src="/logo.svg" alt="" width={24} height={24} className="size-6" priority />
            <span className="text-sm font-bold tracking-tight">Shining</span>
          </Link>

          <Link
            className="ml-2 hidden rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            href={buildLocalizedPath(locale, "privacy")}
          >
            {t(locale, "navPrivacy")}
          </Link>
        </div>

        {/* ── Right: Theme + Language ── */}
        <div className="hidden items-center gap-1.5 sm:flex">
          <ThemeToggle locale={locale} />
          <Link
            className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            href={alternatePath}
          >
            {alternateLocale.toUpperCase()}
          </Link>
        </div>

        {/* ── Mobile menu button ── */}
        <button
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <List size={20} />}
        </button>
      </div>

      {/* Mobile nav panel */}
      <nav
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-200 ease-in-out sm:hidden",
          mobileOpen ? "max-h-64" : "max-h-0 border-t-0"
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            href={buildLocalizedPath(locale, "privacy")}
            onClick={() => setMobileOpen(false)}
          >
            {t(locale, "navPrivacy")}
          </Link>
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            href={alternatePath}
            onClick={() => setMobileOpen(false)}
          >
            {alternateLocale.toUpperCase()}
          </Link>
          <div className="mt-1 px-3 py-1">
            <ThemeToggle locale={locale} />
          </div>
        </div>
      </nav>
    </header>
  );
}
