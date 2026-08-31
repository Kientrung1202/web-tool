"use client";

import { UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import type { Locale } from "@/i18n/locales";
import { t } from "@/i18n/dictionaries";

type FileDropzoneProps = {
  locale: Locale;
  onFiles: (files: File[]) => void;
};

export function FileDropzone({ locale, onFiles }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={`grid min-h-64 place-items-center gap-4 rounded-lg border border-dashed bg-card p-8 text-center transition ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        onFiles(Array.from(event.dataTransfer.files));
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="application/pdf,.pdf"
        multiple
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.currentTarget.value = "";
        }}
      />
      <div className="grid size-14 place-items-center rounded-md bg-primary/10 text-accent-foreground" aria-hidden="true">
        <UploadSimple size={28} weight="duotone" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-card-foreground">{t(locale, "uploadTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(locale, "uploadDescription")}</p>
      </div>
      <button
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 active:translate-y-px"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <UploadSimple size={18} weight="bold" />
        {t(locale, "chooseFiles")}
      </button>
    </div>
  );
}
