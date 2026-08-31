"use client";

import { Gauge, Package } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import type { CompressPreferences, CompressionMode } from "./types";

type CompressSettingsProps = {
  locale: Locale;
  preferences: CompressPreferences;
  onChange: (preferences: CompressPreferences) => void;
};

export function CompressSettings({ locale, preferences, onChange }: CompressSettingsProps) {
  function setMode(mode: CompressionMode) {
    onChange({ ...preferences, mode });
  }

  return (
    <section className="rounded-lg border bg-card p-5" aria-labelledby="compress-options-heading">
      <div className="mb-4">
        <h2 id="compress-options-heading" className="text-xl font-bold text-card-foreground">
          {t(locale, "compressOptions")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {preferences.mode === "balanced" ? t(locale, "balancedDescription") : t(locale, "smallestDescription")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1" role="radiogroup" aria-label={t(locale, "compressOptions")}>
        <button
          aria-checked={preferences.mode === "balanced"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
          role="radio"
          type="button"
          onClick={() => setMode("balanced")}
        >
          <Gauge size={18} />
          {t(locale, "balanced")}
        </button>
        <button
          aria-checked={preferences.mode === "smallest"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
          role="radio"
          type="button"
          onClick={() => setMode("smallest")}
        >
          <Package size={18} />
          {t(locale, "smallestFile")}
        </button>
      </div>
    </section>
  );
}
