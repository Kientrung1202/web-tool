"use client";

import Link from "next/link";
import { CaretDown, CaretUp, DownloadSimple, GitBranch, Plus, ShieldCheck, Trash } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { CompressSettings } from "@/features/compress-pdf/CompressSettings";
import { DEFAULT_COMPRESS_PREFERENCES } from "@/features/compress-pdf/preferences";
import { FileDropzone } from "@/features/merge-pdf/FileDropzone";
import { FileList } from "@/features/merge-pdf/FileList";
import { getLimitLevel } from "@/features/merge-pdf/limits";
import { OutputSettings } from "@/features/merge-pdf/OutputSettings";
import { DEFAULT_PREFERENCES } from "@/features/merge-pdf/preferences";
import { ProgressPanel } from "@/features/merge-pdf/ProgressPanel";
import type { MergeProgress, MergeWorkerOutputFile, PdfFileItem } from "@/features/merge-pdf/types";
import { t } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { formatBytes } from "@/lib/format";
import { DEFAULT_WORKFLOW_CONFIG, isValidWorkflowConfig, loadWorkflowConfig, normalizeWorkflowSteps, saveWorkflowConfig } from "./preferences";
import type { WorkflowConfig, WorkflowStep, WorkflowStepId } from "./types";
import { runWorkflow } from "./workflow-engine";

type DownloadFile = MergeWorkerOutputFile & {
  url: string;
};

const INITIAL_PROGRESS: MergeProgress = {
  stage: "idle",
  current: 0,
  total: 0
};

export function WorkflowBuilderTool({ locale }: { locale: Locale }) {
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [config, setConfig] = useState<WorkflowConfig>(DEFAULT_WORKFLOW_CONFIG);
  const [progress, setProgress] = useState<MergeProgress>(INITIAL_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

  const totalBytes = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);
  const limitLevel = getLimitLevel(files.length, totalBytes, isMobile);
  const normalizedSteps = normalizeWorkflowSteps(config.steps);
  const isValidWorkflow = isValidWorkflowConfig(config);

  useEffect(() => {
    setConfig(loadWorkflowConfig(window.localStorage));
    setIsMobile(typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches);
  }, []);

  useEffect(() => {
    saveWorkflowConfig(typeof window === "undefined" ? undefined : window.localStorage, config);
  }, [config]);

  useEffect(() => {
    return () => {
      downloads.forEach((download) => URL.revokeObjectURL(download.url));
    };
  }, [downloads]);

  function setSteps(steps: WorkflowStep[]) {
    setConfig({ version: 1, steps: normalizeWorkflowSteps(steps) });
  }

  function addStep(id: WorkflowStepId) {
    if (normalizedSteps.some((step) => step.id === id)) {
      return;
    }

    const step: WorkflowStep =
      id === "compress-pdf"
        ? { id: "compress-pdf", settings: DEFAULT_COMPRESS_PREFERENCES }
        : { id: "merge-pdf", settings: DEFAULT_PREFERENCES };
    setSteps([...normalizedSteps, step]);
  }

  function removeStep(id: WorkflowStepId) {
    setSteps(normalizedSteps.filter((step) => step.id !== id));
    setDownloads([]);
    setProgress(INITIAL_PROGRESS);
  }

  function updateStep(nextStep: WorkflowStep) {
    setSteps(normalizedSteps.map((step) => (step.id === nextStep.id ? nextStep : step)));
  }

  function addFiles(nextFiles: File[]) {
    const pdfFiles = nextFiles.filter(isPdfFile);
    if (pdfFiles.length !== nextFiles.length) {
      setError(t(locale, "onlyPdfSupported"));
    } else {
      setError(null);
    }

    setDownloads([]);
    setProgress(INITIAL_PROGRESS);
    setFiles((current) => [
      ...current,
      ...pdfFiles.map((file) => ({
        id: createItemId(),
        file
      }))
    ]);
  }

  function moveFile(id: string, direction: "up" | "down") {
    setFiles((current) => {
      const index = current.findIndex((item) => item.id === id);
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((item) => item.id !== id));
    setDownloads([]);
    setProgress(INITIAL_PROGRESS);
  }

  function clearFiles() {
    setFiles([]);
    setDownloads([]);
    setError(null);
    setProgress(INITIAL_PROGRESS);
  }

  async function runConfiguredWorkflow() {
    if (files.length === 0) {
      setError(t(locale, "noFilesSelectedForWorkflow"));
      return;
    }

    if (!isValidWorkflow) {
      setError(t(locale, "workflowNeedsTwoSteps"));
      return;
    }

    if (limitLevel === "hard") {
      setError(t(locale, "tooManyFiles"));
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      setDownloads((current) => {
        current.forEach((download) => URL.revokeObjectURL(download.url));
        return [];
      });
      setProgress({ stage: "reading", current: 0, total: files.length });

      const workerFiles = [];
      for (const [index, item] of files.entries()) {
        workerFiles.push({
          name: item.file.name,
          bytes: await item.file.arrayBuffer()
        });
        setProgress({ stage: "reading", current: index + 1, total: files.length });
      }

      const result = await runWorkflow({
        files: workerFiles,
        config,
        onProgress: setProgress
      });

      setDownloads(
        result.map((file) => ({
          ...file,
          url: URL.createObjectURL(new Blob([file.bytes], { type: file.mimeType }))
        }))
      );
      setProgress({ stage: "done", current: 1, total: 1 });
    } catch {
      setError(t(locale, "processingFailed"));
      setProgress({ stage: "error", current: 0, total: 0 });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border bg-card/70 p-3 shadow-product lg:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)] lg:p-4">
      <div className="grid gap-4">
        <FileDropzone locale={locale} onFiles={addFiles} />
        <FileList locale={locale} files={files} onMove={moveFile} onRemove={removeFile} />
      </div>

      <aside className="grid content-start gap-4">
        <div className="flex min-h-10 items-center gap-2 rounded-md border bg-primary/10 px-3 text-sm font-semibold text-accent-foreground">
          <ShieldCheck size={20} weight="duotone" />
          <span>{t(locale, "privateByDesign")}</span>
        </div>
        <WorkflowPanel
          locale={locale}
          isCollapsed={isConfigCollapsed}
          steps={normalizedSteps}
          onAdd={addStep}
          onToggleCollapsed={() => setIsConfigCollapsed((current) => !current)}
          onRemove={removeStep}
          onUpdate={updateStep}
        />
        {!isValidWorkflow ? <InvalidWorkflowGuidance locale={locale} steps={normalizedSteps} /> : null}
        <ProgressPanel locale={locale} error={error} limitLevel={limitLevel} progress={progress} totalSize={formatBytes(totalBytes)} />
        <div className="grid gap-2">
          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isProcessing || limitLevel === "hard" || !isValidWorkflow}
            type="button"
            onClick={runConfiguredWorkflow}
          >
            {t(locale, "runWorkflow")}
          </button>
          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
            disabled={files.length === 0 || isProcessing}
            type="button"
            onClick={clearFiles}
          >
            <Trash size={18} />
            {t(locale, "clearFiles")}
          </button>
          {downloads.map((download) => (
            <a
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-card px-4 text-sm font-semibold text-accent-foreground transition hover:bg-primary/10"
              download={download.name}
              href={download.url}
              key={download.name}
            >
              <DownloadSimple size={18} weight="bold" />
              {t(locale, "downloadResult")}
            </a>
          ))}
        </div>
      </aside>
    </section>
  );
}

function WorkflowPanel({
  locale,
  isCollapsed,
  steps,
  onAdd,
  onToggleCollapsed,
  onRemove,
  onUpdate
}: {
  locale: Locale;
  isCollapsed: boolean;
  steps: WorkflowStep[];
  onAdd: (id: WorkflowStepId) => void;
  onToggleCollapsed: () => void;
  onRemove: (id: WorkflowStepId) => void;
  onUpdate: (step: WorkflowStep) => void;
}) {
  const missingSteps: WorkflowStepId[] = ["compress-pdf", "merge-pdf"].filter((id) => !steps.some((step) => step.id === id)) as WorkflowStepId[];

  return (
    <section className="rounded-lg border bg-card p-5" aria-labelledby="workflow-steps-heading">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="workflow-steps-heading" className="text-xl font-bold text-card-foreground">
            {t(locale, "workflowSteps")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(locale, "workflowStepsDescription")}</p>
        </div>
        <button
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border bg-card px-3 text-xs font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
          type="button"
          onClick={onToggleCollapsed}
        >
          {isCollapsed ? <CaretDown size={16} /> : <CaretUp size={16} />}
          {isCollapsed ? t(locale, "expandSettings") : t(locale, "collapseSettings")}
        </button>
      </div>

      <div className="grid gap-3">
        {steps.map((step, index) => (
          <section className="grid gap-3 rounded-md border bg-muted/50 p-3" key={step.id} aria-label={`${t(locale, "step")} ${index + 1}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-card text-sm font-bold text-muted-foreground">{index + 1}</span>
                <h3 className="truncate text-base font-bold text-card-foreground">
                  {step.id === "compress-pdf" ? t(locale, "compressTitle") : t(locale, "mergeTitle")}
                </h3>
              </div>
              <button
                aria-label={`${t(locale, "removeStep")} ${step.id === "compress-pdf" ? t(locale, "compressTitle") : t(locale, "mergeTitle")}`}
                className="grid size-8 shrink-0 place-items-center rounded-md border bg-card text-destructive-foreground transition hover:bg-destructive"
                type="button"
                onClick={() => onRemove(step.id)}
              >
                <Trash size={18} />
              </button>
            </div>
            {isCollapsed ? (
              <p className="rounded-md border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">{getStepSummary(locale, step)}</p>
            ) : step.id === "compress-pdf" ? (
              <CompressSettings locale={locale} preferences={step.settings} onChange={(settings) => onUpdate({ id: "compress-pdf", settings })} />
            ) : (
              <OutputSettings locale={locale} preferences={step.settings} onChange={(settings) => onUpdate({ id: "merge-pdf", settings })} />
            )}
          </section>
        ))}
      </div>

      {missingSteps.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {missingSteps.map((id) => (
            <button
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-accent-foreground"
              key={id}
              type="button"
              onClick={() => onAdd(id)}
            >
              <Plus size={18} />
              {t(locale, "addStep")} {id === "compress-pdf" ? t(locale, "compressTitle") : t(locale, "mergeTitle")}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getStepSummary(locale: Locale, step: WorkflowStep): string {
  if (step.id === "compress-pdf") {
    return `${t(locale, "compressTitle")} · ${step.settings.mode === "balanced" ? t(locale, "balanced") : t(locale, "smallestFile")}`;
  }

  return `${t(locale, "mergeTitle")} · ${step.settings.outputMode === "single" ? t(locale, "singlePdf") : t(locale, "multiplePdfs")}`;
}

function InvalidWorkflowGuidance({ locale, steps }: { locale: Locale; steps: WorkflowStep[] }) {
  const onlyStep = steps[0];
  const href = onlyStep?.id === "merge-pdf" ? `/${locale}/merge-pdf` : `/${locale}/compress-pdf`;
  const label = onlyStep?.id === "merge-pdf" ? t(locale, "mergeTitle") : t(locale, "compressTitle");

  return (
    <section className="rounded-lg border border-warning/40 bg-warning/30 p-4 text-sm text-warning-foreground">
      <div className="flex items-start gap-2">
        <GitBranch size={20} weight="duotone" />
        <div>
          <p>{t(locale, "workflowNeedsTwoSteps")}</p>
          {onlyStep ? (
            <Link className="mt-2 inline-flex font-semibold underline underline-offset-4" href={href}>
              {t(locale, "useStandaloneTool")} {label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function createItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
