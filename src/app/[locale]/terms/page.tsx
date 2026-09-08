import type { Metadata } from "next";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { Separator } from "@/components/ui/separator";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "termsTitle"), t(safeLocale, "termsDescription"), "terms");
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  const sections = [
    { title: "termsSectionScope", body: "termsScopeBody" },
    { title: "termsSectionUse", body: "termsUseBody" },
    { title: "termsSectionIP", body: "termsIPBody" },
    { title: "termsSectionLiability", body: "termsLiabilityBody" },
    { title: "termsSectionModify", body: "termsModifyBody" }
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <article className="rounded-xl border border-border bg-card p-6 md:p-10">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t(safeLocale, "termsLastUpdated")}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
          {t(safeLocale, "termsTitle")}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {t(safeLocale, "termsIntro")}
        </p>

        <Separator className="my-8" />

        {sections.map(({ title, body }, i) => (
          <section key={title} className={i > 0 ? "mt-8" : ""}>
            <h2 className="text-lg font-bold text-card-foreground">{t(safeLocale, title)}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(safeLocale, body)}</p>
          </section>
        ))}
      </article>
    </main>
  );
}
