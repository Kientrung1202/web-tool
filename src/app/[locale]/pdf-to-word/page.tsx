import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { ConvertFileTool } from "@/features/convert-file/ConvertFileTool";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "pdfToWordTitle"), t(safeLocale, "pdfToWordDescription"), "pdf-to-word");
}

export default async function PdfToWordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-5 md:pb-36 md:pt-6">
      <section className="mb-4 rounded-lg border bg-card px-4 py-3 shadow-sm md:px-5">
        <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link className="font-medium transition hover:text-foreground" href={`/${safeLocale}`}>
            {t(safeLocale, "navTools")}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-foreground">{t(safeLocale, "pdfToWordTitle")}</span>
        </nav>
        <h1 className="text-2xl font-bold leading-tight tracking-normal text-card-foreground md:text-3xl">{t(safeLocale, "pdfToWordTitle")}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{t(safeLocale, "pdfToWordDescription")}</p>
      </section>

      <ConvertFileTool
        kind="pdf-to-word"
        locale={safeLocale}
        maxFileSizeMb={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB ?? "20", 10)}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
      <AdSlot label={t(safeLocale, "adReserved")} />

      <section className="mt-5 rounded-lg border bg-card p-6 md:p-8">
        <h2 className="text-2xl font-bold text-card-foreground">{t(safeLocale, "pdfToWordAboutTitle")}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{t(safeLocale, "pdfToWordSeoBody")}</p>
      </section>
    </main>
  );
}
