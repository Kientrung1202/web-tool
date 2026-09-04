import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { getDirectoryTools, getToolBySlug } from "@/lib/tools";
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

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
  const workflowBuilder = getToolBySlug("workflow-builder");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-8 md:pb-36 md:pt-10">
      <section className="mb-6 rounded-lg border bg-card p-6 shadow-product md:p-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              <p className="inline-flex h-12 min-w-16 items-center justify-center rounded-md bg-primary px-4 text-base font-bold text-primary-foreground">
                PDF
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-card-foreground md:text-6xl">
                {t(safeLocale, "directoryTitle")}
              </h1>
            </div>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{t(safeLocale, "directoryIntro")}</p>
          </div>
          {workflowBuilder ? (
            <Link
              className="inline-flex h-10 w-fit shrink-0 items-center justify-center rounded-md border border-secondary/80 bg-secondary px-4 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-secondary/85"
              href={`/${safeLocale}/${workflowBuilder.slug}`}
            >
              {t(safeLocale, workflowBuilder.titleKey)}
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label={t(safeLocale, "directoryTitle")}>
        {getDirectoryTools().map((tool) => (
          <ToolCard key={tool.slug} tool={tool} locale={safeLocale} />
        ))}
      </section>

      <AdSlot label={t(safeLocale, "adReserved")} />
    </main>
  );
}
