import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getComingSoonTools, getToolBySlug } from "@/lib/tools";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => getComingSoonTools().map((tool) => ({ locale, toolSlug: tool.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}): Promise<Metadata> {
  const { locale, toolSlug } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.active) return buildMetadata(safeLocale, t(safeLocale, "directoryTitle"), t(safeLocale, "directoryDescription"));
  return buildMetadata(safeLocale, t(safeLocale, tool.titleKey), t(safeLocale, tool.descriptionKey), tool.slug);
}

export default async function ComingSoonPage({
  params
}: {
  params: Promise<{ locale: string; toolSlug: string }>;
}) {
  const { locale, toolSlug } = await params;
  if (!isLocale(locale)) notFound();
  const tool = getToolBySlug(toolSlug);
  if (!tool || tool.active) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-16">
      <section className="rounded-xl border border-border bg-card p-6 md:p-10">
        <Badge variant="outline" className="rounded-full text-xs">
          {t(locale, "comingSoon")}
        </Badge>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-card-foreground md:text-5xl">
          {t(locale, tool.titleKey)}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          {t(locale, tool.descriptionKey)}
        </p>
        <div className="my-7 grid min-h-32 place-items-center rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground" aria-disabled="true">
          {t(locale, "comingSoonBody")}
        </div>
        <Button asChild>
          <Link href={`/${locale}/merge-pdf`}>
            {t(locale, "tryMergePdf")}
          </Link>
        </Button>
      </section>
    </main>
  );
}
