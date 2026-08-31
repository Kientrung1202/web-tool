import { PDFDocument, StandardFonts } from "pdf-lib";

export async function createPdfBytes(label: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([300, 160]);
  page.drawText(label, { x: 36, y: 92, size: 18, font });
  return pdf.save();
}
