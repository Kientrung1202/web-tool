import type { Metadata } from "next";
import { WorkbenchLayout } from "@/components/WorkbenchLayout";
import { MergePdfTool } from "@/features/merge-pdf/MergePdfTool";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "mergeTitle"), t(safeLocale, "mergeDescription"), "merge-pdf");
}

export default async function MergePdfPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <WorkbenchLayout
      locale={safeLocale}
      title={t(safeLocale, "mergeTitle")}
      description={t(safeLocale, "mergeDescription")}
      breadcrumbKey="mergeTitle"
      privacyLabel={t(safeLocale, "filesStayBrowser")}
      aboutTitle={t(safeLocale, "mergeAboutTitle")}
      aboutBody={t(safeLocale, "mergeSeoBody")}
    >
      <MergePdfTool locale={safeLocale} />
    </WorkbenchLayout>
  );
}
