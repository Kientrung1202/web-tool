"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ToolIcon } from "@/components/ToolIcon";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/locales";
import { buildLocalizedPath } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { TOOLS } from "@/lib/tools";
import { cn } from "@/lib/utils";

type Props = {
  locale: Locale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ToolSearch({ locale, open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Reset query when dialog opens
  useEffect(() => {
    if (open) setQuery("");
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return TOOLS;
    const q = query.toLowerCase();
    return TOOLS.filter(
      (tool) =>
        t(locale, tool.titleKey).toLowerCase().includes(q) ||
        t(locale, tool.descriptionKey).toLowerCase().includes(q) ||
        tool.slug.includes(q)
    );
  }, [query, locale]);

  const navigate = useCallback(
    (slug: string) => {
      onOpenChange(false);
      router.push(buildLocalizedPath(locale, slug));
    },
    [locale, onOpenChange, router]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{t(locale, "searchLabel")}</DialogTitle>

        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4">
          <MagnifyingGlass size={18} className="shrink-0 text-muted-foreground" />
          <Input
            placeholder={t(locale, "searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 border-0 bg-transparent px-0 text-sm shadow-none outline-none ring-0 focus-visible:ring-0"
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {t(locale, "searchNoResults")}
            </p>
          )}
          {filtered.map((tool) => {
            const title = t(locale, tool.titleKey);
            const tag = tool.tagKey ? t(locale, tool.tagKey) : null;

            return (
              <button
                key={tool.slug}
                onClick={() => navigate(tool.slug)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                  !tool.active && "opacity-50"
                )}
              >
                <span
                  className={cn(
                    "inline-grid size-8 shrink-0 place-items-center rounded-md",
                    tool.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}
                >
                  <ToolIcon icon={tool.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{title}</span>
                    {tag && (
                      <Badge variant="outline" className="rounded-full border-primary/30 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-primary">
                        {tag}
                      </Badge>
                    )}
                    {!tool.active && (
                      <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[9px]">
                        {t(locale, "comingSoon")}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {t(locale, tool.descriptionKey)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
