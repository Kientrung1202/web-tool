"""Temporary job directory helpers."""

from __future__ import annotations

import os
import re
import shutil
import time
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.config import Settings


def _sanitize(name: str) -> str:
    """Strip anything that isn't alphanumeric, dot, dash, or underscore."""
    cleaned = re.sub(r"[^a-zA-Z0-9._-]", "_", name).lstrip("_")
    return cleaned or "upload"


@dataclass
class TempJob:
    """Represents a short-lived working directory for one conversion."""

    job_id: str
    dir: Path
    output_dir: Path
    profile_dir: Path

    def input_path(self, file_name: str) -> Path:
        return self.dir / _sanitize(file_name)

    def cleanup(self) -> None:
        shutil.rmtree(self.dir, ignore_errors=True)


def create_temp_job(settings: Settings) -> TempJob:
    """Create a fresh temp directory with input / output / profile sub-dirs."""
    base = Path(settings.temp_dir)
    base.mkdir(parents=True, exist_ok=True)

    job_id = uuid.uuid4().hex
    job_dir = base / job_id
    output_dir = job_dir / "output"
    profile_dir = job_dir / "profile"

    output_dir.mkdir(parents=True, exist_ok=True)
    profile_dir.mkdir(parents=True, exist_ok=True)

    return TempJob(
        job_id=job_id,
        dir=job_dir,
        output_dir=output_dir,
        profile_dir=profile_dir,
    )


def cleanup_expired_jobs(settings: Settings) -> int:
    """Remove job directories older than the configured TTL."""
    base = Path(settings.temp_dir)
    base.mkdir(parents=True, exist_ok=True)

    removed = 0
    now = time.time()

    for entry in base.iterdir():
        if not entry.is_dir():
            continue
        mtime = entry.stat().st_mtime
        if settings.temp_ttl_seconds == 0 or (now - mtime) >= settings.temp_ttl_seconds:
            shutil.rmtree(entry, ignore_errors=True)
            removed += 1

    return removed
