import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { getComingSoonTools, getToolBySlug } from "@/lib/tools";

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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
      <section className="rounded-lg border bg-card p-6 shadow-product md:p-10">
        <span className="inline-flex h-8 items-center rounded-md bg-muted px-3 text-sm font-semibold text-muted-foreground">
          {t(locale, "comingSoon")}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-normal text-card-foreground md:text-6xl">{t(locale, tool.titleKey)}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{t(locale, tool.descriptionKey)}</p>
        <div className="my-7 grid min-h-36 place-items-center rounded-lg border border-dashed bg-muted p-8 text-center text-muted-foreground" aria-disabled="true">
          {t(locale, "comingSoonBody")}
        </div>
        <Link
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          href={`/${locale}/merge-pdf`}
        >
          {t(locale, "tryMergePdf")}
        </Link>
      </section>
    </main>
  );
}
