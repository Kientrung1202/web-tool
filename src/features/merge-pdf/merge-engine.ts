import { zipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import type { MergeProgress, MergeWorkerOutputFile, OutputMode, WorkerPdfFile } from "./types";

type MergePdfFilesInput = {
  files: WorkerPdfFile[];
  outputMode: OutputMode;
  maxSizeMb: number;
  onProgress?: (progress: MergeProgress) => void;
};

const PDF_MIME = "application/pdf";
const ZIP_MIME = "application/zip";
const MB = 1024 * 1024;

export async function mergePdfFiles(input: MergePdfFilesInput): Promise<MergeWorkerOutputFile[]> {
  if (input.outputMode === "single") {
    return [await mergeIntoSinglePdf(input.files, input.onProgress)];
  }

  return [await mergeIntoZip(input.files, input.maxSizeMb, input.onProgress)];
}

async function mergeIntoSinglePdf(
  files: WorkerPdfFile[],
  onProgress?: MergePdfFilesInput["onProgress"]
): Promise<MergeWorkerOutputFile> {
  const output = await PDFDocument.create();

  for (const [index, file] of files.entries()) {
    onProgress?.({ stage: "building", current: index + 1, total: files.length });
    await appendPdf(output, file.bytes);
  }

  const bytes = await output.save();
  return {
    name: "merged.pdf",
    mimeType: PDF_MIME,
    bytes: toTransferableBuffer(bytes)
  };
}

async function mergeIntoZip(
  files: WorkerPdfFile[],
  maxSizeMb: number,
  onProgress?: MergePdfFilesInput["onProgress"]
): Promise<MergeWorkerOutputFile> {
  const maxBytes = Math.max(1, maxSizeMb) * MB;
  const pdfOutputs = await buildSizedPdfOutputs(files, maxBytes, onProgress);
  const zipEntries: Record<string, Uint8Array> = {};

  for (const [index, pdf] of pdfOutputs.entries()) {
    zipEntries[`merged-${index + 1}.pdf`] = new Uint8Array(pdf.bytes);
  }

  onProgress?.({ stage: "zipping", current: pdfOutputs.length, total: pdfOutputs.length });
  const zipBytes = zipSync(zipEntries, { level: 6 });

  return {
    name: "merged-pdfs.zip",
    mimeType: ZIP_MIME,
    bytes: toTransferableBuffer(zipBytes)
  };
}

async function buildSizedPdfOutputs(
  files: WorkerPdfFile[],
  maxBytes: number,
  onProgress?: MergePdfFilesInput["onProgress"]
): Promise<MergeWorkerOutputFile[]> {
  const outputs: MergeWorkerOutputFile[] = [];
  let currentDoc = await PDFDocument.create();
  let currentBytes: Uint8Array | undefined;
  let currentFileCount = 0;

  for (const [index, file] of files.entries()) {
    onProgress?.({ stage: "building", current: index + 1, total: files.length });
    await appendPdf(currentDoc, file.bytes);
    const candidateBytes = await currentDoc.save();

    if (currentFileCount > 0 && candidateBytes.byteLength > maxBytes && currentBytes) {
      outputs.push(createOutputPdf(currentBytes, outputs.length + 1));
      currentDoc = await PDFDocument.create();
      await appendPdf(currentDoc, file.bytes);
      currentBytes = await currentDoc.save();
      currentFileCount = 1;
      continue;
    }

    currentBytes = candidateBytes;
    currentFileCount += 1;
  }

  if (currentBytes) {
    outputs.push(createOutputPdf(currentBytes, outputs.length + 1));
  }

  return outputs;
}

async function appendPdf(target: PDFDocument, bytes: ArrayBuffer): Promise<void> {
  const source = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = await target.copyPages(source, source.getPageIndices());
  for (const page of pages) {
    target.addPage(page);
  }
}

function createOutputPdf(bytes: Uint8Array, index: number): MergeWorkerOutputFile {
  return {
    name: `merged-${index}.pdf`,
    mimeType: PDF_MIME,
    bytes: toTransferableBuffer(bytes)
  };
}

function toTransferableBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
