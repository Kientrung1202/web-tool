import type { Metadata } from "next";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "privacyTitle"), t(safeLocale, "privacyDescription"), "privacy");
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-10">
      <section className="rounded-lg border bg-card p-6 shadow-product md:p-8">
        <h1 className="text-4xl font-bold tracking-normal text-card-foreground md:text-5xl">{t(safeLocale, "privacyTitle")}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{t(safeLocale, "privacyDescription")}</p>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{t(safeLocale, "privacyBody")}</p>
      </section>
    </main>
  );
}
