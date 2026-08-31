import type { Metadata } from "next";
import { AdSlot } from "@/components/AdSlot";
import { ToolCard } from "@/components/ToolCard";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { TOOLS } from "@/lib/tools";
import { buildMetadata } from "@/lib/seo";

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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <section className="mb-6 rounded-lg border bg-card p-6 shadow-product md:p-10">
        <div>
          <p className="mb-5 inline-flex h-9 min-w-12 items-center justify-center rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground">
            PDF
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-normal text-card-foreground md:text-6xl">
            {t(safeLocale, "directoryTitle")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{t(safeLocale, "directoryIntro")}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label={t(safeLocale, "directoryTitle")}>
        {TOOLS.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} locale={safeLocale} />
        ))}
      </section>

      <AdSlot label={t(safeLocale, "adReserved")} />
    </main>
  );
}
