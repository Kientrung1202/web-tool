"""PDF compression using Ghostscript."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass
from pathlib import Path

from fastapi import HTTPException


@dataclass(frozen=True)
class CompressionResult:
    output_path: Path
    file_name: str
    mime_type: str = "application/pdf"


async def compress_pdf(
    *,
    input_path: Path,
    output_path: Path,
    original_file_name: str,
    mode: str,
    timeout_seconds: int = 120,
) -> CompressionResult:
    """Compress a PDF with Ghostscript image/font optimization presets."""
    preset = "/screen" if mode == "smallest" else "/ebook"
    resolution = "96" if mode == "smallest" else "150"

    cmd = [
        "gs",
        "-sDEVICE=pdfwrite",
        "-dCompatibilityLevel=1.4",
        f"-dPDFSETTINGS={preset}",
        "-dNOPAUSE",
        "-dQUIET",
        "-dBATCH",
        "-dDetectDuplicateImages=true",
        "-dCompressFonts=true",
        "-dSubsetFonts=true",
        "-dDownsampleColorImages=true",
        "-dDownsampleGrayImages=true",
        "-dDownsampleMonoImages=true",
        f"-dColorImageResolution={resolution}",
        f"-dGrayImageResolution={resolution}",
        f"-dMonoImageResolution={resolution}",
        f"-sOutputFile={output_path}",
        str(input_path),
    ]

    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await asyncio.wait_for(
            process.communicate(),
            timeout=timeout_seconds,
        )
    except asyncio.TimeoutError:
        process.kill()
        await process.wait()
        raise HTTPException(status_code=504, detail="Compression timed out")
    except FileNotFoundError:
        raise HTTPException(
            status_code=500,
            detail="Ghostscript (gs) is not installed. Install it to enable PDF compression.",
        )

    if process.returncode != 0:
        msg = stderr.decode(errors="replace").strip() if stderr else "Ghostscript failed"
        raise HTTPException(status_code=500, detail=msg)

    if not output_path.exists():
        raise HTTPException(status_code=500, detail="Compressed PDF was not created")

    # Do not return a larger file just because the PDF was already optimized.
    if output_path.stat().st_size >= input_path.stat().st_size:
        output_path.unlink(missing_ok=True)
        output_path = input_path

    return CompressionResult(
        output_path=output_path,
        file_name=_compressed_file_name(original_file_name),
    )


def _compressed_file_name(file_name: str) -> str:
    stem = Path(file_name).stem or "compressed"
    return f"{stem}-compressed.pdf"
