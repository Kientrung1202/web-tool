import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { buildMetadata } from "@/lib/seo";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";
  return buildMetadata(safeLocale, t(safeLocale, "aboutTitle"), t(safeLocale, "aboutDescription"), "about");
}

const TOOL_KEYS = [
  "aboutToolMerge",
  "aboutToolCompress",
  "aboutToolWorkflow",
  "aboutToolWordToPdf",
  "aboutToolPdfToWord"
];

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "en";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 md:py-16">
      <article className="rounded-xl border border-border bg-card p-6 md:p-10">
        <h1 className="text-3xl font-bold tracking-tight text-card-foreground md:text-4xl">
          {t(safeLocale, "aboutTitle")}
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          {t(safeLocale, "aboutIntro")}
        </p>

        <Separator className="my-8" />

        {/* How it works */}
        <section>
          <h2 className="text-lg font-bold text-card-foreground">{t(safeLocale, "aboutSectionHow")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(safeLocale, "aboutHowBody")}</p>
        </section>

        <Separator className="my-8" />

        {/* Available tools */}
        <section>
          <h2 className="text-lg font-bold text-card-foreground">{t(safeLocale, "aboutSectionToolsTitle")}</h2>
          <ul className="mt-4 space-y-4">
            {TOOL_KEYS.map((key) => {
              const text = t(safeLocale, key);
              const dashIndex = text.indexOf("—");
              const name = dashIndex > 0 ? text.slice(0, dashIndex).trim() : text;
              const desc = dashIndex > 0 ? text.slice(dashIndex + 1).trim() : "";
              const isServer = key === "aboutToolWordToPdf" || key === "aboutToolPdfToWord";

              return (
                <li key={key} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-card-foreground">{name}</span>
                    {isServer && (
                      <Badge variant="outline" className="rounded-full px-2 py-0 text-[10px]">
                        Server
                      </Badge>
                    )}
                  </div>
                  {desc && (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* Mission */}
        <section>
          <h2 className="text-lg font-bold text-card-foreground">{t(safeLocale, "aboutSectionMission")}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{t(safeLocale, "aboutMissionBody")}</p>
        </section>

        {/* CTA */}
        <div className="mt-8">
          <Button asChild>
            <Link href={buildLocalizedPath(safeLocale)}>{t(safeLocale, "navTools")}</Link>
          </Button>
        </div>
      </article>
    </main>
  );
}
