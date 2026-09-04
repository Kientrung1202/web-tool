"""PDF → Word converter using pdf2docx (direct Python call, no subprocess)."""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from pdf2docx import Converter


@dataclass(frozen=True)
class ConversionResult:
    output_path: Path
    file_name: str
    mime_type: str = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


def count_pdf_pages(file_bytes: bytes) -> int:
    """Quick page count by scanning for /Type /Page markers (no full parse)."""
    text = file_bytes.decode("latin-1", errors="ignore")
    matches = re.findall(r"/Type\s*/Page\b", text)
    return len(matches)


def convert_pdf_to_word(
    *,
    input_path: Path,
    output_path: Path,
) -> ConversionResult:
    """Convert a PDF file to DOCX using pdf2docx.

    This is a direct Python library call — no subprocess, no external
    binary required.  ``pdf2docx`` uses PyMuPDF internally to analyze
    the PDF layout and reconstructs tables / text / images in a DOCX.
    """
    cv = Converter(str(input_path))
    try:
        cv.convert(str(output_path))
    finally:
        cv.close()

    stem = input_path.stem
    return ConversionResult(
        output_path=output_path,
        file_name=f"{stem}.docx",
    )
