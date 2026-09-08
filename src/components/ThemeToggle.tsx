"use client";

import { Monitor, Sun, Moon } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const THEMES = [
  { key: "system" as const, icon: Monitor, labelKey: "themeSystem" },
  { key: "light" as const, icon: Sun, labelKey: "themeLight" },
  { key: "dark" as const, icon: Moon, labelKey: "themeDark" }
];

export function ThemeToggle({ locale }: { locale: Locale }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5" role="radiogroup" aria-label="Theme">
      {THEMES.map(({ key, icon: Icon, labelKey }) => (
        <button
          key={key}
          role="radio"
          aria-checked={theme === key}
          aria-label={t(locale, labelKey)}
          onClick={() => setTheme(key)}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors",
            theme === key
              ? "bg-background text-foreground shadow-sm"
              : "hover:text-foreground"
          )}
        >
          <Icon size={14} weight={theme === key ? "fill" : "regular"} />
        </button>
      ))}
    </div>
  );
}
