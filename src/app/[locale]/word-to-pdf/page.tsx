import type { Metadata } from "next";
import { WorkbenchLayout } from "@/components/WorkbenchLayout";
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
  return buildMetadata(safeLocale, t(safeLocale, "wordToPdfTitle"), t(safeLocale, "wordToPdfDescription"), "word-to-pdf");
}

export default async function WordToPdfPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <WorkbenchLayout
      locale={safeLocale}
      title={t(safeLocale, "wordToPdfTitle")}
      description={t(safeLocale, "wordToPdfDescription")}
      breadcrumbKey="wordToPdfTitle"
      aboutTitle={t(safeLocale, "wordToPdfAboutTitle")}
      aboutBody={t(safeLocale, "wordToPdfSeoBody")}
    >
      <ConvertFileTool
        kind="word-to-pdf"
        locale={safeLocale}
        maxFileSizeMb={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB ?? "20", 10)}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
    </WorkbenchLayout>
  );
}
