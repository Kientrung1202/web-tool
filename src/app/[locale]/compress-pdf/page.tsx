import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { CompressPdfTool } from "@/features/compress-pdf/CompressPdfTool";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "compressTitle"), t(safeLocale, "compressDescription"), "compress-pdf");
}

export default async function CompressPdfPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-5 md:py-6">
      <section className="mb-4 rounded-lg border bg-card px-4 py-3 shadow-sm md:px-5">
        <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link className="font-medium transition hover:text-foreground" href={`/${safeLocale}`}>
            {t(safeLocale, "navTools")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-foreground">{t(safeLocale, "compressTitle")}</span>
        </nav>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight tracking-normal text-card-foreground md:text-3xl">
              {t(safeLocale, "compressTitle")}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{t(safeLocale, "compressDescription")}</p>
          </div>
          <span className="inline-flex h-8 w-fit shrink-0 items-center rounded-md border border-primary/20 bg-primary/10 px-3 text-sm font-semibold text-accent-foreground">
            {t(safeLocale, "filesStayBrowser")}
          </span>
        </div>
      </section>

      <CompressPdfTool locale={safeLocale} />
      <AdSlot label={t(safeLocale, "adReserved")} />

      <section className="mt-5 rounded-lg border bg-card p-6 md:p-8">
        <h2 className="text-2xl font-bold text-card-foreground">{t(safeLocale, "compressAboutTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{t(safeLocale, "compressSeoBody")}</p>
      </section>
    </main>
  );
}
