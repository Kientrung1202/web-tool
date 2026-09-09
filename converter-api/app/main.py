"""FastAPI application — file conversion API (PDF↔Word).

Drop-in replacement for the Node MJS converter-api.  Reads the same
``CONVERTER_*`` env vars and exposes the same HTTP endpoints so the
Next.js frontend rewrite rule works unchanged.
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from os import path
from pathlib import Path
from zipfile import ZIP_STORED, ZipFile

from fastapi import FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.config import Settings, load_settings
from app.converters.compress_pdf import compress_pdf
from app.converters.pdf_to_word import convert_pdf_to_word, count_pdf_pages
from app.converters.word_to_pdf import convert_word_to_pdf
from app.security import (
    RateLimiter,
    assert_upload_allowed,
    get_remote_ip,
    validate_internal_proxy_token,
    validate_origin,
    validate_turnstile_token,
)
from app.utils.temp_files import TempJob, cleanup_expired_jobs, create_temp_job

logger = logging.getLogger("converter-api")

# ---------------------------------------------------------------------------
# Concurrency limiter (same semantics as the MJS jobLimiter)
# ---------------------------------------------------------------------------


class JobLimiter:
    """Limits concurrent conversion jobs with an overflow queue."""

    def __init__(self, max_concurrent: int, queue_max: int) -> None:
        self._semaphore = asyncio.Semaphore(max_concurrent)
        self._max_concurrent = max_concurrent
        self._queue_max = queue_max
        self._waiting = 0

    async def run(self, coro):
        if self._semaphore._value == 0 and self._waiting >= self._queue_max:  # noqa: SLF001
            raise HTTPException(status_code=429, detail="Server is busy")

        self._waiting += 1
        try:
            await self._semaphore.acquire()
        finally:
            self._waiting -= 1

        try:
            return await coro
        finally:
            self._semaphore.release()


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------

_settings: Settings | None = None
_rate_limiter: RateLimiter | None = None
_job_limiter: JobLimiter | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _settings, _rate_limiter, _job_limiter

    _settings = load_settings()
    _rate_limiter = RateLimiter(
        window_seconds=_settings.rate_limit_window_seconds,
        max_requests=_settings.rate_limit_max_requests,
    )
    _job_limiter = JobLimiter(
        max_concurrent=_settings.max_concurrent_jobs,
        queue_max=_settings.queue_max_size,
    )

    # Initial cleanup of stale temp dirs
    cleanup_expired_jobs(_settings)

    logger.info(
        "converter-api listening on %s:%s",
        _settings.host,
        _settings.port,
    )

    yield

    # Final cleanup on shutdown
    cleanup_expired_jobs(_settings)


app = FastAPI(title="Converter API", lifespan=lifespan)


# CORS — configured dynamically after settings are loaded
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin")
    if origin and _settings and origin in _settings.allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Vary"] = "Origin"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, CF-Turnstile-Response"
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/healthz")
async def healthz():
    return {"ok": True}


@app.post("/api/convert/{kind}")
async def convert(kind: str, request: Request):
    """Handle PDF/Word conversion and PDF compression."""
    if kind not in ("pdf-to-word", "word-to-pdf", "compress-pdf"):
        raise HTTPException(status_code=404, detail="Not found")

    settings = _settings
    assert settings is not None

    # Security checks
    validate_internal_proxy_token(request, settings)
    validate_origin(request, settings)
    remote_ip = get_remote_ip(request)
    assert _rate_limiter is not None
    _rate_limiter.assert_allowed(remote_ip)

    # Parse multipart form
    form = await request.form()
    uploaded_files: list[UploadFile] = [
        item for item in form.getlist("file") if hasattr(item, "read")
    ]  # type: ignore[list-item]
    turnstile_token: str = str(form.get("cf-turnstile-response", ""))
    compression_mode = str(form.get("mode", "balanced"))

    if not uploaded_files:
        raise HTTPException(status_code=400, detail="A file is required")

    if kind != "compress-pdf" and len(uploaded_files) != 1:
        raise HTTPException(status_code=400, detail="Exactly one file is required")
    if kind == "compress-pdf" and len(uploaded_files) > settings.max_files_per_request:
        raise HTTPException(status_code=413, detail="Too many files")
    if kind == "compress-pdf" and compression_mode not in ("balanced", "smallest"):
        raise HTTPException(status_code=422, detail="Unsupported compression mode")

    # Read file content
    uploads: list[tuple[str, bytes]] = []
    for uploaded_file in uploaded_files:
        file_bytes = await uploaded_file.read()
        file_name = uploaded_file.filename or "upload"
        uploads.append((file_name, file_bytes))

    if kind == "compress-pdf" and sum(len(file_bytes) for _, file_bytes in uploads) > settings.max_file_size_bytes:
        raise HTTPException(status_code=413, detail="Compression batch is too large")

    # Validate turnstile
    await validate_turnstile_token(turnstile_token, remote_ip, settings)

    # Validate uploads
    for file_name, file_bytes in uploads:
        assert_upload_allowed(
            file_size=len(file_bytes),
            file_extension=path.splitext(file_name)[1],
            kind=kind,
            settings=settings,
        )

    # Run conversion inside job limiter
    assert _job_limiter is not None
    job = create_temp_job(settings)

    async def do_convert():
        try:
            if kind == "pdf-to-word":
                file_name, file_bytes = uploads[0]
                input_path = job.input_path(file_name)
                input_path.write_bytes(file_bytes)
                pages = count_pdf_pages(file_bytes)
                if pages > settings.max_pdf_pages:
                    raise HTTPException(status_code=413, detail="PDF has too many pages")

                job.output_dir.mkdir(parents=True, exist_ok=True)
                output_path = job.output_dir / f"{input_path.stem}.docx"

                # pdf2docx is CPU-bound — run in a thread to avoid blocking
                result = await asyncio.to_thread(
                    convert_pdf_to_word,
                    input_path=input_path,
                    output_path=output_path,
                )
            elif kind == "word-to-pdf":
                file_name, file_bytes = uploads[0]
                input_path = job.input_path(file_name)
                input_path.write_bytes(file_bytes)
                result = await convert_word_to_pdf(
                    input_path=input_path,
                    output_dir=job.output_dir,
                    profile_dir=job.profile_dir,
                    timeout_seconds=settings.timeout_seconds,
                )
            else:
                results = []
                deadline = asyncio.get_running_loop().time() + settings.timeout_seconds
                for index, (file_name, file_bytes) in enumerate(uploads):
                    input_path = job.input_path(f"{index}-{file_name}")
                    input_path.write_bytes(file_bytes)
                    output_path = job.output_dir / f"{index}-{Path(file_name).stem}-compressed.pdf"
                    remaining_seconds = int(deadline - asyncio.get_running_loop().time())
                    if remaining_seconds <= 0:
                        raise HTTPException(status_code=504, detail="Compression timed out")
                    results.append(
                        await compress_pdf(
                            input_path=input_path,
                            output_path=output_path,
                            original_file_name=file_name,
                            mode=compression_mode,
                            timeout_seconds=remaining_seconds,
                        )
                    )

                if len(results) == 1:
                    result = results[0]
                else:
                    archive_path = job.output_dir / "compressed-pdfs.zip"
                    used_names: set[str] = set()
                    with ZipFile(archive_path, "w", compression=ZIP_STORED) as archive:
                        for item in results:
                            archive_name = _unique_archive_name(item.file_name, used_names)
                            archive.write(item.output_path, arcname=archive_name)
                    return FileResponse(
                        path=str(archive_path),
                        filename="compressed-pdfs.zip",
                        media_type="application/zip",
                        headers={"Cache-Control": "no-store"},
                        background=_cleanup_task(job),
                    )

            return FileResponse(
                path=str(result.output_path),
                filename=result.file_name,
                media_type=result.mime_type,
                headers={"Cache-Control": "no-store"},
                background=_cleanup_task(job),
            )
        except HTTPException:
            job.cleanup()
            raise
        except Exception:
            job.cleanup()
            logger.exception("[converter-api] Unhandled error during conversion")
            raise HTTPException(status_code=500, detail="Conversion failed")

    return await _job_limiter.run(do_convert())


def _unique_archive_name(file_name: str, used_names: set[str]) -> str:
    candidate = file_name
    stem = Path(file_name).stem
    suffix = Path(file_name).suffix
    index = 2
    while candidate in used_names:
        candidate = f"{stem}-{index}{suffix}"
        index += 1
    used_names.add(candidate)
    return candidate


class _cleanup_task:
    """Background task that cleans up the temp job directory after response."""

    def __init__(self, job: TempJob) -> None:
        self._job = job

    async def __call__(self) -> None:
        self._job.cleanup()


# ---------------------------------------------------------------------------
# Entrypoint (``python -m app.main`` or ``uvicorn app.main:app``)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    settings = load_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.node_env == "development",
    )
