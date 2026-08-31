import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import type { ToolDefinition } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";

type Props = {
  tool: ToolDefinition;
  locale: Locale;
};

export function ToolCard({ tool, locale }: Props) {
  const title = t(locale, tool.titleKey);
  const body = (
    <>
      <div>
        <span className="mb-6 inline-grid size-11 place-items-center rounded-md bg-primary/10 text-accent-foreground" aria-hidden="true">
          <ToolIcon icon={tool.icon} />
        </span>
        <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(locale, tool.descriptionKey)}</p>
      </div>
      {!tool.active && (
        <span className="mt-7 inline-flex w-fit rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {t(locale, "comingSoon")}
        </span>
      )}
    </>
  );

  if (!tool.active) {
    return (
      <Link
        className="flex min-h-44 flex-col justify-between rounded-lg border bg-muted/70 p-5 transition hover:border-primary/30 hover:bg-muted"
        href={buildLocalizedPath(locale, tool.slug)}
        aria-label={`${title} ${t(locale, "comingSoon")}`}
      >
        {body}
      </Link>
    );
  }

  return (
    <Link
      className="flex min-h-44 flex-col justify-between rounded-lg border bg-card p-5 shadow-product transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
      href={buildLocalizedPath(locale, tool.slug)}
      aria-label={title}
    >
      {body}
    </Link>
  );
}
