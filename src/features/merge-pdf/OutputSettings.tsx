"use client";

import { FilePdf, Files, Package } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import type { MergePreferences, OutputMode } from "./types";

type OutputSettingsProps = {
  locale: Locale;
  preferences: MergePreferences;
  onChange: (preferences: MergePreferences) => void;
};

export function OutputSettings({ locale, preferences, onChange }: OutputSettingsProps) {
  function setOutputMode(outputMode: OutputMode) {
    onChange({ ...preferences, outputMode });
  }

  function setMaxSize(value: string) {
    const next = Number(value);
    if (Number.isFinite(next)) {
      onChange({ ...preferences, maxSizeMb: Math.min(500, Math.max(1, next)) });
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5" aria-labelledby="output-options-heading">
      <div className="mb-4">
        <div>
          <h2 id="output-options-heading" className="text-xl font-bold text-card-foreground">{t(locale, "outputOptions")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {preferences.outputMode === "single" ? t(locale, "outputCountSingle") : t(locale, "outputCountMultiple")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1" role="radiogroup" aria-label={t(locale, "outputOptions")}>
        <button
          aria-checked={preferences.outputMode === "single"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
          role="radio"
          type="button"
          onClick={() => setOutputMode("single")}
        >
          <FilePdf size={18} />
          {t(locale, "singlePdf")}
        </button>
        <button
          aria-checked={preferences.outputMode === "multiple"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-muted px-3 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground aria-checked:border-primary aria-checked:bg-primary aria-checked:text-primary-foreground"
          role="radio"
          type="button"
          onClick={() => setOutputMode("multiple")}
        >
          <Package size={18} />
          {t(locale, "multiplePdfs")}
        </button>
      </div>

      {preferences.outputMode === "multiple" ? (
        <>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-card-foreground">
            <span className="inline-flex items-center gap-2">
              <Files size={18} />
              {t(locale, "targetMaxSize")}
            </span>
            <div className="grid grid-cols-[minmax(0,1fr)_3.5rem] overflow-hidden rounded-md border bg-card">
              <input
                className="h-10 w-full bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                inputMode="numeric"
                min={1}
                max={500}
                step={1}
                type="number"
                value={preferences.maxSizeMb}
                onChange={(event) => setMaxSize(event.target.value)}
              />
              <span className="grid place-items-center border-l text-sm font-semibold text-muted-foreground">{t(locale, "targetMaxSizeUnit")}</span>
            </div>
          </label>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{t(locale, "maxSizeHelp")}</p>
        </>
      ) : null}
    </section>
  );
}
