"""Security helpers: origin check, proxy token, Turnstile, rate limiter."""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

import httpx
from fastapi import HTTPException, Request

if TYPE_CHECKING:
    from app.config import Settings


# ---------------------------------------------------------------------------
# Origin / proxy-token validation
# ---------------------------------------------------------------------------

def validate_internal_proxy_token(request: Request, settings: Settings) -> None:
    """Reject requests without the correct internal proxy token (prod only)."""
    if not settings.internal_proxy_token and settings.node_env != "production":
        return
    actual = request.headers.get("x-internal-proxy-token", "")
    if actual != settings.internal_proxy_token:
        raise HTTPException(status_code=403, detail="Forbidden")


def validate_origin(request: Request, settings: Settings) -> None:
    """Block requests from disallowed origins."""
    origin = request.headers.get("origin")
    if not origin:
        return
    if origin not in settings.allowed_origins:
        raise HTTPException(status_code=403, detail="Origin not allowed")


# ---------------------------------------------------------------------------
# Cloudflare Turnstile
# ---------------------------------------------------------------------------

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


async def validate_turnstile_token(
    token: str,
    remote_ip: str,
    settings: Settings,
) -> None:
    """Verify a Cloudflare Turnstile response token."""
    if not settings.turnstile_secret_key and settings.node_env != "production":
        return
    if not token or len(token) > 2048:
        raise HTTPException(status_code=400, detail="Turnstile token is required")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TURNSTILE_VERIFY_URL,
            json={
                "secret": settings.turnstile_secret_key,
                "response": token,
                "remoteip": remote_ip,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Turnstile validation failed")

    result = resp.json()
    if not result.get("success"):
        raise HTTPException(status_code=400, detail="Turnstile validation failed")


# ---------------------------------------------------------------------------
# IP extraction
# ---------------------------------------------------------------------------

def get_remote_ip(request: Request) -> str:
    """Best-effort client IP from proxy headers."""
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip:
        return cf_ip

    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()

    return request.client.host if request.client else "unknown"


# ---------------------------------------------------------------------------
# In-memory rate limiter (per IP, sliding window)
# ---------------------------------------------------------------------------

@dataclass
class _Bucket:
    count: int = 0
    reset_at: float = 0.0


class RateLimiter:
    """Simple per-IP rate limiter matching the MJS implementation."""

    def __init__(self, window_seconds: int, max_requests: int) -> None:
        self._window = window_seconds
        self._max = max_requests
        self._hits: dict[str, _Bucket] = {}

    def assert_allowed(self, ip: str) -> None:
        now = time.monotonic()
        bucket = self._hits.get(ip)

        if bucket is None or bucket.reset_at <= now:
            self._hits[ip] = _Bucket(count=1, reset_at=now + self._window)
            return

        bucket.count += 1
        if bucket.count > self._max:
            raise HTTPException(status_code=429, detail="Too many requests")


# ---------------------------------------------------------------------------
# Upload validation
# ---------------------------------------------------------------------------

WORD_EXTENSIONS = frozenset({".doc", ".docx", ".odt", ".rtf"})


def assert_upload_allowed(
    *,
    file_size: int,
    file_extension: str,
    kind: str,
    settings: Settings,
) -> None:
    """Validate file size and extension for the given conversion kind."""
    if file_size > settings.max_file_size_bytes:
        raise HTTPException(status_code=413, detail="File too large")

    ext = file_extension.lower()
    if kind == "word-to-pdf" and ext not in WORD_EXTENSIONS:
        raise HTTPException(status_code=422, detail="Unsupported file type")
    if kind == "pdf-to-word" and ext != ".pdf":
        raise HTTPException(status_code=422, detail="Unsupported file type")
