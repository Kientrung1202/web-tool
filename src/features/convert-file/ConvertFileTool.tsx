"use client";

import Script from "next/script";
import { DownloadSimple, FileArrowDown, FilePdf, Trash, UploadSimple } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";

type ConvertKind = "word-to-pdf" | "pdf-to-word";

type Props = {
  kind: ConvertKind;
  locale: Locale;
  maxFileSizeMb: number;
  turnstileSiteKey: string;
};

type Download = {
  url: string;
  fileName: string;
};

const ACCEPT: Record<ConvertKind, string> = {
  "word-to-pdf": ".doc,.docx,.odt,.rtf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "pdf-to-word": ".pdf,application/pdf"
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ConvertFileTool({ kind, locale, maxFileSizeMb, turnstileSiteKey }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [download, setDownload] = useState<Download | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const maxBytes = maxFileSizeMb * 1024 * 1024;

  useEffect(() => {
    return () => {
      if (download) URL.revokeObjectURL(download.url);
    };
  }, [download]);

  function handleFile(nextFile: File | undefined) {
    setError("");
    setStatus("");
    if (download) URL.revokeObjectURL(download.url);
    setDownload(null);

    if (!nextFile) {
      setFile(null);
      return;
    }

    // Keep the file in state even if too large, so the file card
    // (with remove button) still renders and the user can dismiss it.
    setFile(nextFile);

    if (nextFile.size > maxBytes) {
      setError(t(locale, "convertFileTooLarge"));
    }
  }

  function removeFile() {
    setFile(null);
    setError("");
    setStatus("");
    if (download) URL.revokeObjectURL(download.url);
    setDownload(null);
  }

  async function submit() {
    if (!file) {
      setError(t(locale, "convertChooseOneFile"));
      return;
    }

    const token = getTurnstileToken(formRef.current);
    if (turnstileSiteKey && !token) {
      setError(t(locale, "convertVerificationRequired"));
      return;
    }

    setIsConverting(true);
    setError("");
    setStatus(t(locale, "convertUploading"));

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("cf-turnstile-response", token);

      const response = await fetch(`/api/convert/${kind}`, {
        method: "POST",
        body
      });

      if (!response.ok) {
        throw new Error(errorMessageForStatus(response.status, locale));
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownload({ url, fileName: fileNameFromResponse(response, kind) });
      setStatus(t(locale, "readyToDownload"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t(locale, "convertFailed"));
      setStatus("");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border bg-card/70 p-3 shadow-product lg:grid-cols-[minmax(0,1fr)_22rem] lg:p-4">
      {turnstileSiteKey ? <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" /> : null}
      <form ref={formRef} className="grid gap-4 rounded-lg border bg-card p-5" onSubmit={(event) => event.preventDefault()}>
        <input
          ref={inputRef}
          aria-label={t(locale, "chooseFile")}
          className="sr-only"
          type="file"
          accept={ACCEPT[kind]}
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />

        <div className="grid min-h-56 place-items-center gap-4 rounded-lg border border-dashed bg-muted/40 p-6 text-center">
          <div className="grid size-14 place-items-center rounded-md bg-primary/10 text-accent-foreground" aria-hidden="true">
            <FileArrowDown size={28} weight="duotone" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">{t(locale, "convertUploadTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(locale, "convertMaxFileSize").replace("{size}", String(maxFileSizeMb))}</p>
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:translate-y-px"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <UploadSimple size={18} weight="bold" />
            {t(locale, "chooseFile")}
          </button>
        </div>

        {/* File list — shown below the drop zone when a file is selected */}
        {file ? (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-all">
            <div className="grid size-10 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-accent-foreground" aria-hidden="true">
              <FilePdf size={22} weight="duotone" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-card-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <button
              className="grid size-8 flex-shrink-0 place-items-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive-foreground"
              type="button"
              onClick={removeFile}
              aria-label={t(locale, "clearFiles")}
            >
              <Trash size={16} weight="bold" />
            </button>
          </div>
        ) : null}

        {turnstileSiteKey ? <div className="cf-turnstile" data-sitekey={turnstileSiteKey} /> : null}
      </form>

      <aside className="grid content-start gap-4 rounded-lg border bg-card p-5">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">{t(locale, "outputSummary")}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {file ? t(locale, "convertEmptyState").replace(t(locale, "convertEmptyState"), `1 ${locale === "vi" ? "file đã chọn" : "file selected"}`) : t(locale, "convertEmptyState")}
          </p>
          {kind === "pdf-to-word" ? <p className="mt-3 text-sm leading-6 text-warning-foreground">{t(locale, "pdfToWordBestEffort")}</p> : null}
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3">
            <p className="flex-1 text-sm text-destructive-foreground">{error}</p>
            <button
              className="grid size-6 flex-shrink-0 place-items-center rounded text-destructive-foreground/70 transition hover:bg-destructive/20 hover:text-destructive-foreground"
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        ) : null}
        {status ? <p className="rounded-md border border-primary/20 bg-primary/10 p-3 text-sm text-accent-foreground">{status}</p> : null}

        <button
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:translate-y-px disabled:opacity-50"
          type="button"
          disabled={!file || isConverting || !!error}
          onClick={submit}
        >
          {isConverting ? t(locale, "convertConverting") : t(locale, "convertButton")}
        </button>

        {download ? (
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent"
            href={download.url}
            download={download.fileName}
          >
            <DownloadSimple size={18} weight="bold" />
            {t(locale, "downloadResult")}
          </a>
        ) : null}
      </aside>
    </section>
  );
}

function getTurnstileToken(form: HTMLFormElement | null) {
  const input = form?.querySelector<HTMLInputElement>('input[name="cf-turnstile-response"]');
  return input?.value ?? "";
}

function fileNameFromResponse(response: Response, kind: ConvertKind) {
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  if (match) return match[1];
  return kind === "word-to-pdf" ? "converted.pdf" : "converted.docx";
}

function errorMessageForStatus(status: number, locale: Locale) {
  if (status === 413) return t(locale, "convertLimitError");
  if (status === 429) return t(locale, "convertRateLimited");
  if (status === 504) return t(locale, "convertTimedOut");
  if (status === 400 || status === 403) return t(locale, "convertVerificationFailed");
  return t(locale, "convertFailed");
}
