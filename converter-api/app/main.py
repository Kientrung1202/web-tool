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

from fastapi import FastAPI, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from app.config import Settings, load_settings
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
    """Handle both pdf-to-word and word-to-pdf conversions."""
    if kind not in ("pdf-to-word", "word-to-pdf"):
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
    uploaded_file: UploadFile | None = form.get("file")  # type: ignore[assignment]
    turnstile_token: str = str(form.get("cf-turnstile-response", ""))

    if uploaded_file is None or not hasattr(uploaded_file, "read"):
        raise HTTPException(status_code=400, detail="A file is required")

    # Read file content
    file_bytes = await uploaded_file.read()
    file_name = uploaded_file.filename or "upload"
    file_ext = path.splitext(file_name)[1]

    # Validate turnstile
    await validate_turnstile_token(turnstile_token, remote_ip, settings)

    # Validate upload
    assert_upload_allowed(
        file_size=len(file_bytes),
        file_extension=file_ext,
        kind=kind,
        settings=settings,
    )

    # Run conversion inside job limiter
    assert _job_limiter is not None
    job = create_temp_job(settings)

    async def do_convert():
        try:
            input_path = job.input_path(file_name)
            input_path.write_bytes(file_bytes)

            if kind == "pdf-to-word":
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
            else:
                result = await convert_word_to_pdf(
                    input_path=input_path,
                    output_dir=job.output_dir,
                    profile_dir=job.profile_dir,
                    timeout_seconds=settings.timeout_seconds,
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
