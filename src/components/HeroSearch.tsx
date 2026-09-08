"use client";

import { useCallback, useEffect, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { ToolSearch } from "./ToolSearch";

export function HeroSearch({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex h-12 w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-accent"
          aria-label={t(locale, "searchLabel")}
        >
          <MagnifyingGlass size={18} className="shrink-0" />
          <span className="flex-1 text-left">{t(locale, "searchPlaceholder")}</span>
          <kbd className="pointer-events-none hidden select-none rounded border border-border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline">
            {t(locale, "searchHint")}
          </kbd>
        </button>
      </div>

      <ToolSearch locale={locale} open={open} onOpenChange={setOpen} />
    </>
  );
}
