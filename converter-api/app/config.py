"""Application settings loaded from environment variables.

Mirrors every CONVERTER_* env var from the .env file so the Python
service is a drop-in replacement for the Node MJS version.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field

MB = 1024 * 1024


def _int(value: str | None, default: int, minimum: int = 1) -> int:
    """Parse an env var as int, clamped to *minimum*."""
    if value is None:
        return default
    try:
        return max(int(value), minimum)
    except ValueError:
        return default


def _csv(value: str, default: str = "") -> list[str]:
    """Split a comma-separated env var into a list of trimmed strings."""
    raw = value or default
    return [item.strip() for item in raw.split(",") if item.strip()]


@dataclass(frozen=True)
class Settings:
    node_env: str = "development"

    # File / conversion limits
    max_file_size_bytes: int = 20 * MB
    max_files_per_request: int = 20
    max_pdf_pages: int = 80
    timeout_seconds: int = 120

    # Concurrency
    max_concurrent_jobs: int = 2
    queue_max_size: int = 10

    # Temp file management
    temp_ttl_seconds: int = 300
    temp_dir: str = "/var/tmp/converter/jobs"

    # Network / CORS
    allowed_origins: list[str] = field(default_factory=lambda: ["https://pdf.shining.io.vn"])
    host: str = "127.0.0.1"
    port: int = 3001

    # Security
    internal_proxy_token: str = ""
    turnstile_secret_key: str = ""

    # Rate limiting
    rate_limit_window_seconds: int = 60
    rate_limit_max_requests: int = 3


def load_settings(env: dict[str, str] | None = None) -> Settings:
    """Build a ``Settings`` instance from environment variables."""
    if env is None:
        env = dict(os.environ)

    node_env = env.get("NODE_ENV", env.get("CONVERTER_NODE_ENV", "development"))
    internal_proxy_token = env.get("CONVERTER_INTERNAL_PROXY_TOKEN", "")
    turnstile_secret_key = env.get("TURNSTILE_SECRET_KEY", "")

    if node_env == "production" and not internal_proxy_token:
        raise RuntimeError("CONVERTER_INTERNAL_PROXY_TOKEN is required in production")
    if node_env == "production" and not turnstile_secret_key:
        raise RuntimeError("TURNSTILE_SECRET_KEY is required in production")

    return Settings(
        node_env=node_env,
        max_file_size_bytes=_int(env.get("CONVERTER_MAX_FILE_SIZE_MB"), 20, 1) * MB,
        max_files_per_request=_int(env.get("CONVERTER_MAX_FILES_PER_REQUEST"), 20, 1),
        max_pdf_pages=_int(env.get("CONVERTER_MAX_PDF_PAGES"), 80, 1),
        timeout_seconds=_int(env.get("CONVERTER_TIMEOUT_SECONDS"), 120, 5),
        max_concurrent_jobs=_int(env.get("CONVERTER_MAX_CONCURRENT_JOBS"), 2, 1),
        queue_max_size=_int(env.get("CONVERTER_QUEUE_MAX_SIZE"), 10, 0),
        temp_ttl_seconds=_int(env.get("CONVERTER_TEMP_TTL_SECONDS"), 300, 0),
        temp_dir=env.get("CONVERTER_TEMP_DIR", "/var/tmp/converter/jobs"),
        allowed_origins=_csv(
            env.get("CONVERTER_ALLOWED_ORIGINS", ""),
            "https://pdf.shining.io.vn",
        ),
        host=env.get(
            "CONVERTER_HOST",
            "0.0.0.0" if node_env == "production" else "127.0.0.1",
        ),
        port=_int(env.get("PORT"), 3001, 1),
        internal_proxy_token=internal_proxy_token,
        turnstile_secret_key=turnstile_secret_key,
        rate_limit_window_seconds=_int(env.get("CONVERTER_RATE_LIMIT_WINDOW_SECONDS"), 60, 1),
        rate_limit_max_requests=_int(env.get("CONVERTER_RATE_LIMIT_MAX_REQUESTS"), 3, 1),
    )
