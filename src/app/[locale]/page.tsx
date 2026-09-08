import type { Metadata } from "next";
import { ToolCard } from "@/components/ToolCard";
import { HeroSearch } from "@/components/HeroSearch";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { TOOLS } from "@/lib/tools";
import { buildMetadata } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { AdBannerResponsive } from "@/components/ads/AdBanner";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "directoryTitle"), t(safeLocale, "directoryDescription"));
}

export default async function DirectoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  const activeTools = TOOLS.filter((tool) => tool.active);
  const comingSoonTools = TOOLS.filter((tool) => !tool.active);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-10 md:pb-32 md:pt-16">
      {/* ── Hero ── */}
      <section className="mb-16 text-center md:mb-20">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-6xl">
          {t(safeLocale, "heroHeadline")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {t(safeLocale, "heroSubline")}
        </p>

        {/* Trust chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
            <span className="inline-block size-1.5 rounded-full bg-secondary-foreground/80" aria-hidden="true" />
            {t(safeLocale, "privacyChip")}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
            {t(safeLocale, "noAccountChip")}
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
            {t(safeLocale, "freeChip")}
          </Badge>
        </div>

        {/* Search trigger — replaces CTA button */}
        <HeroSearch locale={safeLocale} />
      </section>

      {/* ── Bento Tool Directory ── */}
      <section aria-label={t(safeLocale, "directoryTitle")}>
        {/* Active tools — uniform 3-col grid, equal height */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} locale={safeLocale} variant="featured" />
          ))}
        </div>

        {/* Coming soon tools — 4-col, muted */}
        {comingSoonTools.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {comingSoonTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} locale={safeLocale} variant="muted" />
            ))}
          </div>
        )}
      </section>

      {/* Ad banner — 728×90 desktop / 320×50 mobile */}
      <AdBannerResponsive className="mt-10" />

    </main>
  );
}
