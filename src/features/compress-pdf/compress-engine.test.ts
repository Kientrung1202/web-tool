import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createPdfBytes } from "@/test/pdf-fixtures";
import { compressPdfFile } from "./compress-engine";

describe("compressPdfFile", () => {
  it("returns a valid PDF with a compressed file name", async () => {
    const bytes = await createPdfBytes("compress me");

    const result = await compressPdfFile({
      file: { name: "sample.pdf", bytes: toArrayBuffer(bytes) },
      mode: "balanced"
    });

    expect(result.name).toBe("sample-compressed.pdf");
    expect(result.mimeType).toBe("application/pdf");
    const pdf = await PDFDocument.load(result.bytes);
    expect(pdf.getPageCount()).toBe(1);
  });

  it("uses the smallest mode without changing the PDF page count", async () => {
    const bytes = await createPdfBytes("smallest");

    const result = await compressPdfFile({
      file: { name: "report.PDF", bytes: toArrayBuffer(bytes) },
      mode: "smallest"
    });

    const pdf = await PDFDocument.load(result.bytes);
    expect(result.name).toBe("report-compressed.pdf");
    expect(pdf.getPageCount()).toBe(1);
  });
});

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
