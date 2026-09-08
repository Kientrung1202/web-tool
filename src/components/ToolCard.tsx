import Link from "next/link";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import type { ToolDefinition } from "@/lib/tools";
import { ToolIcon } from "./ToolIcon";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Variant = "featured" | "standard" | "muted";

type Props = {
  tool: ToolDefinition;
  locale: Locale;
  variant?: Variant;
};

export function ToolCard({ tool, locale, variant = "standard" }: Props) {
  const title = t(locale, tool.titleKey);
  const effectiveVariant: Variant = !tool.active ? "muted" : variant;
  const tag = tool.tagKey ? t(locale, tool.tagKey) : null;

  return (
    <Link
      className={cn(
        // h-full stretches cards to equal height within grid rows
        "group relative flex h-full flex-col rounded-xl border p-5 transition-all duration-200",
        effectiveVariant === "featured" &&
          "border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg active:translate-y-0 active:scale-[0.995]",
        effectiveVariant === "standard" &&
          "border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg active:translate-y-0 active:scale-[0.995]",
        effectiveVariant === "muted" &&
          "border-border/60 bg-muted/40 opacity-60 hover:opacity-80 hover:border-border"
      )}
      href={buildLocalizedPath(locale, tool.slug)}
      prefetch={false}
      aria-label={effectiveVariant === "muted" ? `${title} — ${t(locale, "comingSoon")}` : title}
    >
      {/* Tag + Icon row */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-grid size-10 shrink-0 place-items-center rounded-lg",
            effectiveVariant === "muted"
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary"
          )}
          aria-hidden="true"
        >
          <ToolIcon icon={tool.icon} />
        </span>

        {/* Tag badge (e.g. "Advanced" for Workflow Builder) */}
        {tag && effectiveVariant !== "muted" && (
          <Badge variant="outline" className="shrink-0 rounded-full border-primary/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {tag}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h2
        className={cn(
          "mt-4 text-base font-bold leading-tight",
          effectiveVariant === "muted" ? "text-muted-foreground" : "text-card-foreground"
        )}
      >
        {title}
      </h2>

      {/* Description — grows to fill remaining space so cards align */}
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {t(locale, tool.descriptionKey)}
      </p>

      {/* Coming soon badge */}
      {effectiveVariant === "muted" && (
        <Badge variant="outline" className="mt-3 w-fit text-xs">
          {t(locale, "comingSoon")}
        </Badge>
      )}
    </Link>
  );
}
