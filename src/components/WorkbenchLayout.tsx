import type { ReactNode } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { Badge } from "@/components/ui/badge";

type Props = {
  locale: Locale;
  title: string;
  description: string;
  breadcrumbKey: string;
  privacyLabel?: string;
  aboutTitle?: string;
  aboutBody?: string;
  children: ReactNode;
};

/**
 * Shared workbench layout for tool pages.
 * Renders breadcrumb header, tool title, optional privacy badge,
 * the tool component, and an optional about section.
 */
export function WorkbenchLayout({
  locale,
  title,
  description,
  breadcrumbKey,
  privacyLabel,
  aboutTitle,
  aboutBody,
  children,
}: Props) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-5 md:pb-32 md:pt-6">
      {/* Tool header panel */}
      <section className="mb-4 rounded-xl border border-border bg-card px-5 py-4 md:px-6">
        <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link className="font-medium transition-colors hover:text-foreground" href={`/${locale}`}>
            {t(locale, "navTools")}
          </Link>
          <span aria-hidden="true" className="text-border">/</span>
          <span className="font-medium text-foreground">{t(locale, breadcrumbKey)}</span>
        </nav>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-card-foreground md:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
          {privacyLabel && (
            <Badge variant="secondary" className="w-fit shrink-0 gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <span className="inline-block size-1.5 rounded-full bg-secondary-foreground/80" aria-hidden="true" />
              {privacyLabel}
            </Badge>
          )}
        </div>
      </section>

      {/* Tool component */}
      {children}


      {/* About / SEO section */}
      {aboutTitle && aboutBody && (
        <section className="mt-5 rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold text-card-foreground md:text-2xl">{aboutTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{aboutBody}</p>
        </section>
      )}
    </main>
  );
}
