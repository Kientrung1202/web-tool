"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import type { LimitLevel, MergeProgress } from "./types";

type ProgressPanelProps = {
  locale: Locale;
  error: string | null;
  limitLevel: LimitLevel;
  progress: MergeProgress;
  totalSize: string;
};

export function ProgressPanel({ locale, error, limitLevel, progress, totalSize }: ProgressPanelProps) {
  const warning = getWarning(locale, limitLevel);
  const stageLabel = getStageLabel(locale, progress.stage);
  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <section className="rounded-lg border bg-card p-5" aria-labelledby="summary-heading" aria-live="polite">
      <div className="mb-4">
        <div>
          <h2 id="summary-heading" className="text-xl font-bold text-card-foreground">{t(locale, "outputSummary")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(locale, "totalSize")}: {totalSize}</p>
        </div>
      </div>

      {warning ? (
        <div
          className={`mb-3 flex items-start gap-2 rounded-md border p-3 text-sm ${
            limitLevel === "hard"
              ? "border-destructive/40 bg-destructive/20 text-destructive-foreground"
              : "border-warning/40 bg-warning/30 text-warning-foreground"
          }`}
        >
          <WarningCircle size={20} weight="duotone" />
          <span>{warning}</span>
        </div>
      ) : null}

      {error ? (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/20 p-3 text-sm text-destructive-foreground">
          <WarningCircle size={20} weight="duotone" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>{stageLabel}</span>
          <strong>{percent}%</strong>
        </div>
        <progress className="h-2.5 w-full overflow-hidden rounded-full accent-primary" max={100} value={percent} />
      </div>

      {progress.stage === "done" ? (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-success/40 bg-success/25 p-3 text-sm text-success-foreground">
          <CheckCircle size={20} weight="duotone" />
          <span>{t(locale, "readyToDownload")}</span>
        </div>
      ) : null}
    </section>
  );
}

function getWarning(locale: Locale, limitLevel: LimitLevel): string | null {
  if (limitLevel === "hard") return t(locale, "hardLimitWarning");
  if (limitLevel === "strong") return t(locale, "strongLimitWarning");
  if (limitLevel === "soft") return t(locale, "softLimitWarning");
  return null;
}

function getStageLabel(locale: Locale, stage: MergeProgress["stage"]): string {
  if (stage === "reading") return t(locale, "progressReading");
  if (stage === "compressing") return t(locale, "progressCompressing");
  if (stage === "building") return t(locale, "progressBuilding");
  if (stage === "merging") return t(locale, "progressMerging");
  if (stage === "zipping") return t(locale, "progressZipping");
  if (stage === "done") return t(locale, "readyToDownload");
  return t(locale, "readyForFiles");
}
