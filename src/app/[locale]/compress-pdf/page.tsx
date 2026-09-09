import type { Metadata } from "next";
import { WorkbenchLayout } from "@/components/WorkbenchLayout";
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
    <WorkbenchLayout
      locale={safeLocale}
      title={t(safeLocale, "compressTitle")}
      description={t(safeLocale, "compressDescription")}
      breadcrumbKey="compressTitle"
      privacyLabel={t(safeLocale, "temporaryServerProcessing")}
      aboutTitle={t(safeLocale, "compressAboutTitle")}
      aboutBody={t(safeLocale, "compressSeoBody")}
    >
      <CompressPdfTool
        locale={safeLocale}
        maxFileSizeMb={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB ?? "20", 10)}
        maxFilesPerRequest={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILES_PER_REQUEST ?? "20", 10)}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
    </WorkbenchLayout>
  );
}
