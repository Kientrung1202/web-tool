"use client";

import Script from "next/script";
import { DownloadSimple, ShieldCheck, Trash } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { formatBytes } from "@/lib/format";
import { getLimitLevel } from "@/features/merge-pdf/limits";
import { FileDropzone } from "@/features/merge-pdf/FileDropzone";
import { FileList } from "@/features/merge-pdf/FileList";
import { ProgressPanel } from "@/features/merge-pdf/ProgressPanel";
import type { MergeProgress, MergeWorkerOutputFile, PdfFileItem } from "@/features/merge-pdf/types";
import { CompressPdfApiError, compressPdfFiles } from "./compress-engine";
import { CompressSettings } from "./CompressSettings";
import { DEFAULT_COMPRESS_PREFERENCES, loadCompressPreferences, saveCompressPreferences } from "./preferences";
import type { CompressPreferences } from "./types";

type DownloadFile = MergeWorkerOutputFile & {
  url: string;
};

const INITIAL_PROGRESS: MergeProgress = {
  stage: "idle",
  current: 0,
  total: 0
};

type Props = {
  locale: Locale;
  maxFileSizeMb: number;
  maxFilesPerRequest: number;
  turnstileSiteKey: string;
};

export function CompressPdfTool({ locale, maxFileSizeMb, maxFilesPerRequest, turnstileSiteKey }: Props) {
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<PdfFileItem[]>([]);
  const [preferences, setPreferences] = useState<CompressPreferences>(DEFAULT_COMPRESS_PREFERENCES);
  const [progress, setProgress] = useState<MergeProgress>(INITIAL_PROGRESS);
  const [error, setError] = useState<string | null>(null);
  const [downloads, setDownloads] = useState<DownloadFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const totalBytes = useMemo(() => files.reduce((sum, item) => sum + item.file.size, 0), [files]);
  const limitLevel = getLimitLevel(files.length, totalBytes, isMobile);

  useEffect(() => {
    setPreferences(loadCompressPreferences(window.localStorage));
    setIsMobile(typeof window.matchMedia === "function" && window.matchMedia("(max-width: 720px)").matches);
  }, []);

  useEffect(() => {
    saveCompressPreferences(typeof window === "undefined" ? undefined : window.localStorage, preferences);
  }, [preferences]);

  useEffect(() => {
    return () => {
      downloads.forEach((download) => URL.revokeObjectURL(download.url));
    };
  }, [downloads]);

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

  async function compressFiles() {
    if (files.length === 0) {
      setError(t(locale, "noFilesSelectedForCompress"));
      return;
    }

    if (limitLevel === "hard" || files.length > maxFilesPerRequest || totalBytes > maxFileSizeMb * 1024 * 1024) {
      setError(t(locale, "convertLimitError"));
      return;
    }

    const turnstileToken = getTurnstileToken(turnstileRef.current);
    if (turnstileSiteKey && !turnstileToken) {
      setError(t(locale, "convertVerificationRequired"));
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

      setProgress({ stage: "compressing", current: 0, total: workerFiles.length });
      const result = await compressPdfFiles({
        files: workerFiles,
        mode: preferences.mode,
        turnstileToken
      });
      setProgress({ stage: "compressing", current: workerFiles.length, total: workerFiles.length });

      setDownloads(
        result.map((file) => ({
          ...file,
          url: URL.createObjectURL(new Blob([file.bytes], { type: file.mimeType }))
        }))
      );
      setProgress({ stage: "done", current: 1, total: 1 });
    } catch (caught) {
      setError(caught instanceof CompressPdfApiError ? compressErrorMessage(caught.status, locale) : t(locale, "processingFailed"));
      setProgress({ stage: "error", current: 0, total: 0 });
    } finally {
      resetTurnstile();
      setIsProcessing(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border bg-card/70 p-3 shadow-product lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-4">
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /> : null}
      <div className="grid gap-4">
        <FileDropzone locale={locale} onFiles={addFiles} />
        <FileList locale={locale} files={files} onMove={moveFile} onRemove={removeFile} />
      </div>

      <aside className="grid content-start gap-4">
        <div className="flex min-h-10 items-center gap-2 rounded-md border bg-primary/10 px-3 text-sm font-semibold text-accent-foreground">
          <ShieldCheck size={20} weight="duotone" />
          <span>{t(locale, "temporaryServerProcessing")}</span>
        </div>
        <CompressSettings locale={locale} preferences={preferences} onChange={setPreferences} />
        {turnstileSiteKey ? <div ref={turnstileRef} className="cf-turnstile" data-sitekey={turnstileSiteKey} /> : null}
        <ProgressPanel locale={locale} error={error} limitLevel={limitLevel} progress={progress} totalSize={formatBytes(totalBytes)} />
        <div className="grid gap-2">
          <button
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:translate-y-px"
            disabled={
              isProcessing ||
              limitLevel === "hard" ||
              files.length > maxFilesPerRequest ||
              totalBytes > maxFileSizeMb * 1024 * 1024
            }
            type="button"
            onClick={compressFiles}
          >
            {t(locale, "compressButton")}
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

function getTurnstileToken(container: HTMLDivElement | null): string {
  return container?.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]')?.value ?? "";
}

function resetTurnstile() {
  const turnstile = (window as Window & { turnstile?: { reset: () => void } }).turnstile;
  turnstile?.reset();
}

function compressErrorMessage(status: number, locale: Locale): string {
  if (status === 413) return t(locale, "convertLimitError");
  if (status === 429) return t(locale, "convertRateLimited");
  if (status === 504) return t(locale, "convertTimedOut");
  if (status === 400 || status === 403) return t(locale, "convertVerificationFailed");
  return t(locale, "processingFailed");
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
