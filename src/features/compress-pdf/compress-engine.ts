import { unzipSync } from "fflate";
import type { MergeWorkerOutputFile, WorkerPdfFile } from "@/features/merge-pdf/types";
import type { CompressionMode } from "./types";

type CompressPdfFilesInput = {
  files: WorkerPdfFile[];
  mode: CompressionMode;
  turnstileToken?: string;
};

const PDF_MIME = "application/pdf";

export async function compressPdfFiles(input: CompressPdfFilesInput): Promise<MergeWorkerOutputFile[]> {
  if (input.files.length === 0) return [];

  const body = new FormData();
  for (const file of input.files) {
    body.append("file", new Blob([file.bytes], { type: PDF_MIME }), file.name);
  }
  body.append("mode", input.mode);
  body.append("cf-turnstile-response", input.turnstileToken ?? "");

  const response = await fetch("/api/convert/compress-pdf", {
    method: "POST",
    body
  });

  if (!response.ok) {
    throw new CompressPdfApiError(response.status);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/zip")) {
    return Object.entries(unzipSync(bytes))
      .filter(([name]) => name.toLowerCase().endsWith(".pdf"))
      .map(([name, fileBytes]) => ({
        name,
        mimeType: PDF_MIME,
        bytes: toArrayBuffer(fileBytes)
      }));
  }

  return [
    {
      name: fileNameFromResponse(response) ?? getCompressedFileName(input.files[0].name),
      mimeType: PDF_MIME,
      bytes: toArrayBuffer(bytes)
    }
  ];
}

export class CompressPdfApiError extends Error {
  constructor(readonly status: number) {
    super(`Compress PDF API failed with status ${status}`);
    this.name = "CompressPdfApiError";
  }
}

function getCompressedFileName(name: string): string {
  return name.replace(/\.pdf$/i, "") + "-compressed.pdf";
}

function fileNameFromResponse(response: Response): string | null {
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
