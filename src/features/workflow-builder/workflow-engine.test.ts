import { PDFDocument } from "pdf-lib";
import { describe, expect, it, vi } from "vitest";
import { createPdfBytes } from "@/test/pdf-fixtures";
import { DEFAULT_WORKFLOW_CONFIG } from "./preferences";
import { runWorkflow } from "./workflow-engine";

vi.mock("@/features/compress-pdf/compress-engine", () => ({
  compressPdfFiles: vi.fn(async ({ files }: { files: Array<{ name: string; bytes: ArrayBuffer }> }) =>
    files.map((file) => ({
      name: file.name.replace(/\.pdf$/i, "-compressed.pdf"),
      mimeType: "application/pdf",
      bytes: file.bytes
    }))
  )
}));

describe("runWorkflow", () => {
  it("runs the default workflow and returns one merged PDF", async () => {
    const one = await createPdfBytes("one");
    const two = await createPdfBytes("two");

    const result = await runWorkflow({
      files: [
        { name: "one.pdf", bytes: toArrayBuffer(one) },
        { name: "two.pdf", bytes: toArrayBuffer(two) }
      ],
      config: DEFAULT_WORKFLOW_CONFIG
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("merged.pdf");
    const pdf = await PDFDocument.load(result[0].bytes);
    expect(pdf.getPageCount()).toBe(2);
  });

  it("normalizes merge after compress before executing", async () => {
    const one = await createPdfBytes("one");
    const two = await createPdfBytes("two");

    const result = await runWorkflow({
      files: [
        { name: "one.pdf", bytes: toArrayBuffer(one) },
        { name: "two.pdf", bytes: toArrayBuffer(two) }
      ],
      config: {
        version: 1,
        steps: [
          { id: "merge-pdf", settings: { outputMode: "single", maxSizeValue: 25, maxSizeUnit: "MB" } },
          { id: "compress-pdf", settings: { mode: "smallest" } }
        ]
      }
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("merged.pdf");
    const pdf = await PDFDocument.load(result[0].bytes);
    expect(pdf.getPageCount()).toBe(2);
  });
});

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
