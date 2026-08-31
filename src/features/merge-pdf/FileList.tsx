"use client";

import { ArrowDown, ArrowUp, Trash } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";
import { formatBytes } from "@/lib/format";
import type { PdfFileItem } from "./types";

type FileListProps = {
  locale: Locale;
  files: PdfFileItem[];
  onRemove: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
};

export function FileList({ locale, files, onRemove, onMove }: FileListProps) {
  return (
    <section className="rounded-lg border bg-card p-5" aria-labelledby="selected-files-heading">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 id="selected-files-heading" className="text-xl font-bold text-card-foreground">{t(locale, "selectedFiles")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t(locale, "fileOrder")}</p>
        </div>
        <span className="inline-flex h-8 shrink-0 items-center rounded-md bg-muted px-3 text-sm font-semibold text-muted-foreground">
          {files.length} {t(locale, "files")}
        </span>
      </div>

      {files.length === 0 ? (
        <div className="grid min-h-24 place-items-center rounded-md border border-dashed bg-muted/70 p-5 text-center text-sm text-muted-foreground">
          {t(locale, "emptyList")}
        </div>
      ) : (
        <ol className="grid gap-2">
          {files.map((item, index) => (
            <li className="grid min-h-16 grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-3 rounded-md border bg-muted/60 p-2 sm:grid-cols-[2.25rem_minmax(0,1fr)_auto]" key={item.id}>
              <span className="grid size-9 place-items-center rounded-md bg-card text-sm font-bold text-muted-foreground">{index + 1}</span>
              <div className="min-w-0">
                <strong className="block truncate text-sm font-semibold text-card-foreground">{item.file.name}</strong>
                <span className="block text-xs text-muted-foreground">{formatBytes(item.file.size)}</span>
              </div>
              <div className="col-start-2 flex items-center gap-1 sm:col-start-auto">
                <button
                  aria-label={`${t(locale, "moveUp")} ${item.file.name}`}
                  className="grid size-8 place-items-center rounded-md border bg-card text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  disabled={index === 0}
                  type="button"
                  onClick={() => onMove(item.id, "up")}
                >
                  <ArrowUp size={18} />
                </button>
                <button
                  aria-label={`${t(locale, "moveDown")} ${item.file.name}`}
                  className="grid size-8 place-items-center rounded-md border bg-card text-foreground transition hover:bg-accent hover:text-accent-foreground"
                  disabled={index === files.length - 1}
                  type="button"
                  onClick={() => onMove(item.id, "down")}
                >
                  <ArrowDown size={18} />
                </button>
                <button
                  aria-label={`${t(locale, "removeFile")} ${item.file.name}`}
                  className="grid size-8 place-items-center rounded-md border bg-card text-destructive-foreground transition hover:bg-destructive"
                  type="button"
                  onClick={() => onRemove(item.id)}
                >
                  <Trash size={18} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
