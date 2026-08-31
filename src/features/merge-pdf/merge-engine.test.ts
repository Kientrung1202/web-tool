import { unzipSync } from "fflate";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { createPdfBytes } from "@/test/pdf-fixtures";
import { mergePdfFiles } from "./merge-engine";

describe("mergePdfFiles", () => {
  it("merges files into one PDF by default", async () => {
    const one = await createPdfBytes("one");
    const two = await createPdfBytes("two");

    const result = await mergePdfFiles({
      files: [
        { name: "one.pdf", bytes: toArrayBuffer(one) },
        { name: "two.pdf", bytes: toArrayBuffer(two) }
      ],
      outputMode: "single",
      maxSizeMb: 25
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("merged.pdf");
    const pdf = await PDFDocument.load(result[0].bytes);
    expect(pdf.getPageCount()).toBe(2);
  });

  it("returns a ZIP when multiple output mode is selected", async () => {
    const one = await createPdfBytes("one");
    const two = await createPdfBytes("two");

    const result = await mergePdfFiles({
      files: [
        { name: "one.pdf", bytes: toArrayBuffer(one) },
        { name: "two.pdf", bytes: toArrayBuffer(two) }
      ],
      outputMode: "multiple",
      maxSizeMb: 1
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("merged-pdfs.zip");
    const entries = unzipSync(new Uint8Array(result[0].bytes));
    expect(Object.keys(entries)).toEqual(["merged-1.pdf"]);
  });
});

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
