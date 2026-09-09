import type { Metadata } from "next";
import { WorkbenchLayout } from "@/components/WorkbenchLayout";
import { WorkflowBuilderTool } from "@/features/workflow-builder/WorkflowBuilderTool";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "workflowTitle"), t(safeLocale, "workflowDescription"), "workflow-builder");
}

export default async function WorkflowBuilderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <WorkbenchLayout
      locale={safeLocale}
      title={t(safeLocale, "workflowTitle")}
      description={t(safeLocale, "workflowDescription")}
      breadcrumbKey="workflowTitle"
      privacyLabel={t(safeLocale, "workflowServerProcessing")}
      aboutTitle={t(safeLocale, "workflowAboutTitle")}
      aboutBody={t(safeLocale, "workflowSeoBody")}
    >
      <WorkflowBuilderTool
        locale={safeLocale}
        maxFileSizeMb={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILE_SIZE_MB ?? "20", 10)}
        maxFilesPerRequest={Number.parseInt(process.env.NEXT_PUBLIC_CONVERTER_MAX_FILES_PER_REQUEST ?? "20", 10)}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
      />
    </WorkbenchLayout>
  );
}
