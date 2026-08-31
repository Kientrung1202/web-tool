import { PDFDocument } from "pdf-lib";
import type { MergeWorkerOutputFile, WorkerPdfFile } from "@/features/merge-pdf/types";
import type { CompressionMode } from "./types";

type CompressPdfFileInput = {
  file: WorkerPdfFile;
  mode: CompressionMode;
};

const PDF_MIME = "application/pdf";

export async function compressPdfFile(input: CompressPdfFileInput): Promise<MergeWorkerOutputFile> {
  const pdf = await PDFDocument.load(input.file.bytes, { ignoreEncryption: true });
  const bytes = await pdf.save({
    addDefaultPage: false,
    objectsPerTick: input.mode === "smallest" ? 100 : 50,
    useObjectStreams: true
  });

  return {
    name: getCompressedFileName(input.file.name),
    mimeType: PDF_MIME,
    bytes: toTransferableBuffer(bytes)
  };
}

function getCompressedFileName(name: string): string {
  return name.replace(/\.pdf$/i, "") + "-compressed.pdf";
}

function toTransferableBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
